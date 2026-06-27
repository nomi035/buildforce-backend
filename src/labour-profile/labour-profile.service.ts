import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PhoneVerificationService } from 'src/phone-verification/phone-verification.service';
import { ReferralService } from 'src/referral/referral.service';
import { normalizeUsPhone } from 'src/phone-verification/utils/phone.util';
import { Role, User } from 'src/user/entities/user.entity';
import { CreateLabourOnboardingDto } from './dto/create-labour-onboarding.dto';
import { CreateLabourProfileDto } from './dto/create-labour-profile.dto';
import { LabourProfilePaginationDto } from './dto/labour-profile-pagination.dto';
import { TradeSelectionDto } from './dto/trade-selection.dto';
import { UpdateLabourProfileDto } from './dto/update-labour-profile.dto';
import { LabourProfile } from './entities/labour-profile.entity';
import { AvailabilityStatus } from './enums/availability-status.enum';
import {
  ExperienceRange,
  LabourRole,
  LabourRolesByTrade,
  LabourTrade,
  Language,
  SkillLevel,
} from './enums';
import { LabourOnboardingListResponse } from './types/labour-onboarding-list-response.type';
import { LabourOnboardingResponse } from './types/labour-onboarding-response.type';

@Injectable()
export class LabourProfileService {
  constructor(
    @InjectRepository(LabourProfile)
    private readonly labourProfileRepository: Repository<LabourProfile>,
    private readonly dataSource: DataSource,
    private readonly phoneVerificationService: PhoneVerificationService,
    private readonly referralService: ReferralService,
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

  private validateRolesForTrade(trade: LabourTrade, roles: LabourRole[]) {
    if (!roles?.length) {
      throw new BadRequestException(
        `At least one sub-category is required for "${trade}"`,
      );
    }

    const allowedRoles = LabourRolesByTrade[trade] ?? [];
    const invalidRoles = roles.filter((role) => !allowedRoles.includes(role));
    if (invalidRoles.length) {
      throw new BadRequestException(
        `Sub-categor(ies) "${invalidRoles.join('", "')}" are not valid for main category "${trade}"`,
      );
    }
  }

  private validateTradeSelections(tradeSelections: TradeSelectionDto[]) {
    if (!tradeSelections?.length) {
      throw new BadRequestException(
        'At least one main category with sub-categories is required',
      );
    }

    const seenTrades = new Set<LabourTrade>();
    for (const selection of tradeSelections) {
      if (!selection.trade) {
        throw new BadRequestException(
          'Each selection must include a main category',
        );
      }

      if (seenTrades.has(selection.trade)) {
        throw new BadRequestException(
          `Duplicate main category "${selection.trade}"`,
        );
      }
      seenTrades.add(selection.trade);

      if (!LabourRolesByTrade[selection.trade]) {
        throw new BadRequestException(
          `Main category "${selection.trade}" is not valid`,
        );
      }

      this.validateRolesForTrade(selection.trade, selection.roles);
    }
  }

  private validateLanguages(languages: Language[]) {
    if (!languages?.length) {
      throw new BadRequestException('At least one language is required');
    }

    const allowedLanguages = Object.values(Language);
    const invalidLanguages = languages.filter(
      (language) => !allowedLanguages.includes(language),
    );
    if (invalidLanguages.length) {
      throw new BadRequestException(
        `Invalid language(s): "${invalidLanguages.join('", "')}". Allowed values: ${allowedLanguages.join(', ')}`,
      );
    }

    if (new Set(languages).size !== languages.length) {
      throw new BadRequestException('Duplicate languages are not allowed');
    }
  }

  private validateExperience(experience: ExperienceRange) {
    if (!Object.values(ExperienceRange).includes(experience)) {
      throw new BadRequestException(
        `Invalid experience "${experience}". Allowed values: ${Object.values(ExperienceRange).join(', ')}`,
      );
    }
  }

  private validateSkillLevel(skillLevel: SkillLevel) {
    if (!Object.values(SkillLevel).includes(skillLevel)) {
      throw new BadRequestException(
        `Invalid skill level "${skillLevel}". Allowed values: ${Object.values(SkillLevel).join(', ')}`,
      );
    }
  }

  private toLabourOnboardingResponse(
    user: User,
    labourProfile: LabourProfile,
  ): LabourOnboardingResponse {
    return {
      success: true,
      id: labourProfile.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
      },
      languages: (labourProfile.languages ?? []) as Language[],
      zipCode: labourProfile.zipCode,
      state: labourProfile.state,
      county: labourProfile.county,
      tradeSelections: labourProfile.tradeSelections ?? [],
      skillLevel: labourProfile.skillLevel,
      experience: labourProfile.experience as ExperienceRange,
      onboardingCompleted: labourProfile.onboardingCompleted ?? false,
      createdAt: labourProfile.createdAt,
      updatedAt: labourProfile.updatedAt,
    };
  }

  private resolvePagination(pagination?: LabourProfilePaginationDto) {
    const page = Math.max(Number(pagination?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private mapToOnboardingResponse(
    labourProfile: LabourProfile,
  ): LabourOnboardingResponse {
    if (!labourProfile.user) {
      throw new NotFoundException('Labour profile user not found');
    }
    return this.toLabourOnboardingResponse(labourProfile.user, labourProfile);
  }

  private async findOneEntity(id: number): Promise<LabourProfile> {
    const labourProfile = await this.labourProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!labourProfile) {
      throw new NotFoundException('Labour profile not found');
    }
    return labourProfile;
  }

  getTrades() {
    return Object.values(LabourTrade);
  }

  getTradesWithRoles() {
    return Object.entries(LabourRolesByTrade).map(([trade, roles]) => ({
      trade,
      roles,
    }));
  }

  getRolesByTrade(trade: LabourTrade) {
    const roles = LabourRolesByTrade[trade];
    if (!roles) {
      throw new NotFoundException('Trade not found');
    }
    return roles;
  }

  async createNew(createLabourOnboardingDto: CreateLabourOnboardingDto) {
    const {
      user: userDto,
      languages,
      zipCode,
      state,
      county,
      tradeSelections,
      skillLevel,
      experience,
    } = createLabourOnboardingDto;

    this.validateLanguages(languages);
    this.validateSkillLevel(skillLevel);
    this.validateExperience(experience);
    this.validateTradeSelections(tradeSelections);

    if (!userDto?.name || !userDto?.email || !userDto?.password || !userDto?.phone) {
      throw new BadRequestException(
        'User name, email, password, and phone are required',
      );
    }

    const normalizedPhone = normalizeUsPhone(userDto.phone);
    const primarySelection = tradeSelections[0];

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

      const { name, email, password } = userDto;

      const user = manager.create(User, {
        name,
        email,
        password,
        phone: normalizedPhone,
        isPhoneVerified: false,
        role: Role.LABOUR,
      });
      const savedUser = await manager.save(User, user);

      const labourProfile = manager.create(LabourProfile, {
        tradeSelections,
        trade: primarySelection.trade,
        role: primarySelection.roles[0],
        roles: primarySelection.roles,
        languages,
        zipCode,
        state,
        county,
        skillLevel,
        experience,
        onboardingCompleted: true,
        user: savedUser,
      });
      const savedProfile = await manager.save(LabourProfile, labourProfile);

      await this.referralService.applyReferralInTransaction(
        manager,
        createLabourOnboardingDto.promoCode,
        savedUser.id,
      );

      return this.toLabourOnboardingResponse(savedUser, savedProfile);
    });
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

      await this.referralService.applyReferralInTransaction(
        manager,
        createLabourProfileDto.promoCode,
        savedUser.id,
      );

      return {
        user: savedUser,
        labourProfile: savedProfile,
      };
    });
  }

  async findAll(
    pagination?: LabourProfilePaginationDto,
  ): Promise<LabourOnboardingListResponse> {
    const { page, limit, skip } = this.resolvePagination(pagination);

    const [profiles, total] = await this.labourProfileRepository.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: profiles.map((profile) => this.mapToOnboardingResponse(profile)),
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

  async findAvailable() {
    const profiles = await this.labourProfileRepository.find({
      where: { availability: AvailabilityStatus.AVAILABLE },
      relations: ['user'],
    });
    return profiles.map((profile) => this.mapToOnboardingResponse(profile));
  }

  async findOne(id: number) {
    const labourProfile = await this.findOneEntity(id);
    return this.mapToOnboardingResponse(labourProfile);
  }

  async findByUserId(userId: number) {
    const labourProfile = await this.labourProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!labourProfile) {
      return null;
    }
    return this.mapToOnboardingResponse(labourProfile);
  }

  async update(id: number, updateLabourProfileDto: UpdateLabourProfileDto) {
    const existing = await this.findOneEntity(id);
    this.validateRoleForTrade(
      updateLabourProfileDto.trade ?? existing.trade,
      updateLabourProfileDto.role ?? existing.role,
    );
    await this.labourProfileRepository.update(id, updateLabourProfileDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const labourProfile = await this.findOneEntity(id);
    const userId = labourProfile.user?.id;

    return this.dataSource.transaction(async (manager) => {
      await manager.remove(LabourProfile, labourProfile);
      if (userId) {
        await manager.delete(User, userId);
      }
    });
  }
}
