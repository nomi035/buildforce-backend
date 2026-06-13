import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PhoneVerificationService } from 'src/phone-verification/phone-verification.service';
import { normalizeUsPhone } from 'src/phone-verification/utils/phone.util';
import { Role, User } from 'src/user/entities/user.entity';
import { CreateLabourProfileDto } from './dto/create-labour-profile.dto';
import { UpdateLabourProfileDto } from './dto/update-labour-profile.dto';
import { LabourProfile } from './entities/labour-profile.entity';
import { AvailabilityStatus } from './enums/availability-status.enum';
import {
  LabourRole,
  LabourRolesByTrade,
  LabourTrade,
} from './enums';

@Injectable()
export class LabourProfileService {
  constructor(
    @InjectRepository(LabourProfile)
    private readonly labourProfileRepository: Repository<LabourProfile>,
    private readonly dataSource: DataSource,
    private readonly phoneVerificationService: PhoneVerificationService,
  ) {}

  private validateRoleForTrade(trade?: LabourTrade, role?: LabourRole) {
    if (!trade || !role) {
      return;
    }
    const allowedRoles = LabourRolesByTrade[trade] ?? [];
    if (!allowedRoles.includes(role)) {
      throw new BadRequestException(
        `Role "${role}" is not valid for trade "${trade}"`,
      );
    }
  }

  getTrades() {
    return Object.values(LabourTrade);
  }

  getRolesByTrade(trade: LabourTrade) {
    const roles = LabourRolesByTrade[trade];
    if (!roles) {
      throw new NotFoundException('Trade not found');
    }
    return roles;
  }

  async create(createLabourProfileDto: CreateLabourProfileDto) {
    const { phoneVerificationToken, user: userDto, ...profileDto } =
      createLabourProfileDto;

    this.validateRoleForTrade(profileDto.trade, profileDto.role);
    this.phoneVerificationService.assertVerifiedPhone(
      phoneVerificationToken,
      userDto.phone,
    );

    const normalizedPhone = normalizeUsPhone(userDto.phone);

    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOne(User, {
        where: [{ email: userDto.email }, { phone: normalizedPhone }],
      });
      if (existingUser) {
        if (existingUser.email === userDto.email) {
          throw new ConflictException('User with this email already exists');
        }
        throw new ConflictException('User with this phone number already exists');
      }

      const user = manager.create(User, {
        ...userDto,
        phone: normalizedPhone,
        isPhoneVerified: true,
        role: Role.LABOUR,
      });
      const savedUser = await manager.save(User, user);

      const labourProfile = manager.create(LabourProfile, {
        ...profileDto,
        user: savedUser,
      });
      const savedProfile = await manager.save(LabourProfile, labourProfile);

      return {
        user: savedUser,
        labourProfile: savedProfile,
      };
    });
  }

  async findAll() {
    return this.labourProfileRepository.find({ relations: ['user'] });
  }

  async findAvailable() {
    return this.labourProfileRepository.find({
      where: { availability: AvailabilityStatus.AVAILABLE },
      relations: ['user'],
    });
  }

  async findOne(id: number) {
    const labourProfile = await this.labourProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!labourProfile) {
      throw new NotFoundException('Labour profile not found');
    }
    return labourProfile;
  }

  async findByUserId(userId: number) {
    return this.labourProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async update(id: number, updateLabourProfileDto: UpdateLabourProfileDto) {
    const existing = await this.findOne(id);
    this.validateRoleForTrade(
      updateLabourProfileDto.trade ?? existing.trade,
      updateLabourProfileDto.role ?? existing.role,
    );
    await this.labourProfileRepository.update(id, updateLabourProfileDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const labourProfile = await this.findOne(id);
    return this.labourProfileRepository.remove(labourProfile);
  }
}
