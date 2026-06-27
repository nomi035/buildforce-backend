import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { normalizeUsPhone } from 'src/phone-verification/utils/phone.util';
import { ReferralService } from 'src/referral/referral.service';
import { Organization } from 'src/organization/entities/organization.entity';
import { Role, User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CompanyRegistrationDto } from './dto/company-registration.dto';
import { CompanyRegistrationPaginationDto } from './dto/company-registration-pagination.dto';
import { UpdateCompanyRegistrationDto } from './dto/update-company-registration.dto';
import { WorkforceRequirement } from './enums/workforce-requirement.enum';

@Injectable()
export class CompanyRegistrationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly dataSource: DataSource,
    private readonly referralService: ReferralService,
  ) {}

  private validateWorkforceRequirement(workforceRequirement: WorkforceRequirement) {
    if (!Object.values(WorkforceRequirement).includes(workforceRequirement)) {
      throw new BadRequestException(
        `Invalid workforce requirement. Allowed values: ${Object.values(WorkforceRequirement).join(', ')}`,
      );
    }
  }

  private resolvePagination(pagination?: CompanyRegistrationPaginationDto) {
    const page = Math.max(Number(pagination?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private toCompanyResponse(organization: Organization) {
    const user = organization.user;
    if (!user) {
      throw new NotFoundException('Company user not found');
    }

    return {
      success: true,
      id: organization.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        role: user.role,
      },
      companyName: organization.companyName,
      businessLicenseNumber: organization.registrationNumber,
      contactPerson: organization.contactPerson,
      streetAddress: organization.address,
      zipCode: organization.zipCode,
      location: organization.location,
      county: organization.county,
      workforceRequirement: organization.workforceRequirement,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  async register(dto: CompanyRegistrationDto) {
    this.validateWorkforceRequirement(dto.workforceRequirement);

    const normalizedPhone = normalizeUsPhone(dto.phone);

    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOne(User, {
        where: [{ email: dto.email }, { phone: normalizedPhone }],
      });
      if (existingUser) {
        if (existingUser.email === dto.email) {
          throw new ConflictException('User with this email already exists');
        }
        throw new ConflictException('User with this phone number already exists');
      }

      const user = manager.create(User, {
        name: dto.contactPerson,
        email: dto.email,
        password: dto.password,
        phone: normalizedPhone,
        address: dto.streetAddress,
        role: Role.COMPANY,
        isPhoneVerified: false,
      });
      const savedUser = await manager.save(User, user);

      const organization = manager.create(Organization, {
        companyName: dto.companyName,
        registrationNumber: dto.businessLicenseNumber,
        contactPerson: dto.contactPerson,
        address: dto.streetAddress,
        zipCode: dto.zipCode,
        location: dto.location,
        county: dto.county,
        workforceRequirement: dto.workforceRequirement,
        user: savedUser,
      });
      const savedOrganization = await manager.save(Organization, organization);

      await this.referralService.applyReferralInTransaction(
        manager,
        dto.promoCode,
        savedUser.id,
      );

      return this.toCompanyResponse(savedOrganization);
    });
  }

  async findAll(pagination?: CompanyRegistrationPaginationDto) {
    const { page, limit, skip } = this.resolvePagination(pagination);

    const [organizations, total] =
      await this.organizationRepository.findAndCount({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: organizations.map((organization) =>
        this.toCompanyResponse(organization),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalPages > 0,
      },
    };
  }

  async findOne(id: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!organization) {
      throw new NotFoundException('Company not found');
    }
    return this.toCompanyResponse(organization);
  }

  async update(id: number, dto: UpdateCompanyRegistrationDto) {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!organization) {
      throw new NotFoundException('Company not found');
    }

    if (dto.workforceRequirement) {
      this.validateWorkforceRequirement(dto.workforceRequirement);
    }

    const manager = this.organizationRepository.manager;

    if (dto.email || dto.phone) {
      const normalizedPhone = dto.phone
        ? normalizeUsPhone(dto.phone)
        : organization.user.phone;
      const email = dto.email ?? organization.user.email;

      const existingUser = await manager.findOne(User, {
        where: [{ email }, { phone: normalizedPhone }],
      });
      if (existingUser && existingUser.id !== organization.user.id) {
        throw new ConflictException('Email or phone already in use');
      }
    }

    const userUpdate = {
      ...(dto.contactPerson && { name: dto.contactPerson }),
      ...(dto.email && { email: dto.email }),
      ...(dto.password && { password: dto.password }),
      ...(dto.phone && { phone: normalizeUsPhone(dto.phone) }),
      ...(dto.streetAddress && { address: dto.streetAddress }),
    };

    if (Object.keys(userUpdate).length) {
      await manager.update(User, organization.user.id, userUpdate);
    }

    await manager.update(Organization, id, {
      ...(dto.companyName && { companyName: dto.companyName }),
      ...(dto.businessLicenseNumber && {
        registrationNumber: dto.businessLicenseNumber,
      }),
      ...(dto.contactPerson && { contactPerson: dto.contactPerson }),
      ...(dto.streetAddress && { address: dto.streetAddress }),
      ...(dto.zipCode && { zipCode: dto.zipCode }),
      ...(dto.location && { location: dto.location }),
      ...(dto.county && { county: dto.county }),
      ...(dto.workforceRequirement && {
        workforceRequirement: dto.workforceRequirement,
      }),
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!organization) {
      throw new NotFoundException('Company not found');
    }

    const userId = organization.user?.id;

    return this.dataSource.transaction(async (manager) => {
      await manager.remove(Organization, organization);
      if (userId) {
        await manager.delete(User, userId);
      }
    });
  }
}
