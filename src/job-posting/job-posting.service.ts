import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExperienceRange } from 'src/labour-profile/enums/experience-range.enum';
import {
  LabourRole,
  LabourRolesByTrade,
  LabourTrade,
} from 'src/labour-profile/enums';
import { SkillLevel } from 'src/labour-profile/enums/skill-level.enum';
import { OrganizationService } from 'src/organization/organization.service';
import { Role } from 'src/user/entities/user.entity';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { JobPostingPaginationDto } from './dto/job-posting-pagination.dto';
import { JobPostingSearchDto } from './dto/job-posting-search.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { JobPosting } from './entities/job-posting.entity';
import { JobStatus } from './enums/job-status.enum';
import { JobType } from './enums/job-type.enum';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MIN_SEARCH_LENGTH = 3;

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
    private readonly organizationService: OrganizationService,
  ) {}

  private normalizeOptionalString(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed || null;
  }

  private parseOptionalDate(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? new Date(trimmed) : null;
  }

  private formatDate(value?: Date | string | null) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().slice(0, 10);
  }

  private normalizeCreateDto(dto: CreateJobPostingDto): CreateJobPostingDto {
    return {
      ...dto,
      title: dto.title?.trim(),
      description: this.normalizeOptionalString(dto.description) ?? undefined,
      skillLevel: dto.skillLevel || undefined,
      experience: dto.experience || undefined,
      positionsAvailable: dto.positionsAvailable ?? 1,
      streetAddress: dto.streetAddress?.trim(),
      zipCode: dto.zipCode?.trim(),
      location: dto.location?.trim(),
      state: this.normalizeOptionalString(dto.state) ?? undefined,
      county: this.normalizeOptionalString(dto.county) ?? undefined,
      startTime: dto.startTime?.trim(),
      endTime: dto.endTime?.trim(),
      startDate: this.normalizeOptionalString(dto.startDate) ?? undefined,
      endDate: this.normalizeOptionalString(dto.endDate) ?? undefined,
      status: dto.status ?? JobStatus.OPEN,
    };
  }

  private resolvePagination(pagination?: JobPostingPaginationDto) {
    const page = Math.max(Number(pagination?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private escapeLikeTerm(value: string) {
    return value.replace(/[%_\\]/g, '\\$&');
  }

  /** Returns null if fewer than 3 characters — filters are ignored until then */
  private resolveSearchTerm(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length < MIN_SEARCH_LENGTH) {
      return null;
    }
    return this.escapeLikeTerm(trimmed);
  }

  private likePattern(term: string) {
    return `%${term}%`;
  }

  private applyPublicJobSearch(
    qb: SelectQueryBuilder<JobPosting>,
    search?: JobPostingSearchDto,
  ) {
    const query = this.resolveSearchTerm(search?.query);
    const location = this.resolveSearchTerm(search?.location);
    const county = this.resolveSearchTerm(search?.county);
    const zip = this.resolveSearchTerm(search?.zip);
    const trade = this.resolveSearchTerm(search?.trade);

    if (query) {
      const pattern = this.likePattern(query);
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('job.title ILIKE :queryPattern', { queryPattern: pattern })
            .orWhere('job.description ILIKE :queryPattern', { queryPattern: pattern })
            .orWhere('job.trade ILIKE :queryPattern', { queryPattern: pattern })
            .orWhere('job.roles ILIKE :queryPattern', { queryPattern: pattern })
            .orWhere('job.location ILIKE :queryPattern', { queryPattern: pattern })
            .orWhere('job.county ILIKE :queryPattern', { queryPattern: pattern })
            .orWhere('job.zipCode ILIKE :queryPattern', { queryPattern: pattern })
            .orWhere('organization.companyName ILIKE :queryPattern', {
              queryPattern: pattern,
            });
        }),
      );
    }

    if (location) {
      const pattern = this.likePattern(location);
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('job.location ILIKE :locationPattern', { locationPattern: pattern })
            .orWhere('job.state ILIKE :locationPattern', { locationPattern: pattern });
        }),
      );
    }

    if (county) {
      qb.andWhere('job.county ILIKE :countyPattern', {
        countyPattern: this.likePattern(county),
      });
    }

    if (zip) {
      qb.andWhere('job.zipCode ILIKE :zipPattern', {
        zipPattern: this.likePattern(zip),
      });
    }

    if (trade) {
      const rawTrade = search?.trade?.trim();
      if (
        rawTrade &&
        Object.values(LabourTrade).includes(rawTrade as LabourTrade)
      ) {
        qb.andWhere('job.trade = :tradeExact', { tradeExact: rawTrade });
      } else {
        const pattern = this.likePattern(trade);
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where('CAST(job.trade AS text) ILIKE :tradePattern', {
                tradePattern: pattern,
              })
              .orWhere('job.title ILIKE :tradePattern', { tradePattern: pattern })
              .orWhere('job.roles ILIKE :tradePattern', { tradePattern: pattern })
              .orWhere('job.description ILIKE :tradePattern', {
                tradePattern: pattern,
              });
          }),
        );
      }
    }

    const companyId = Number(search?.companyId);
    if (search?.companyId != null && !Number.isNaN(companyId) && companyId > 0) {
      qb.andWhere('organization.id = :companyId', { companyId });
    }
  }

  private validateTime(value: string, field: string) {
    if (!TIME_PATTERN.test(value)) {
      throw new BadRequestException(
        `${field} must be in 24-hour HH:mm format (e.g. "07:00", "15:30")`,
      );
    }
  }

  private validateJobType(jobType: JobType) {
    if (!Object.values(JobType).includes(jobType)) {
      throw new BadRequestException(
        `Invalid job type. Allowed values: ${Object.values(JobType).join(', ')}`,
      );
    }
  }

  private validateStatus(status: JobStatus) {
    if (!Object.values(JobStatus).includes(status)) {
      throw new BadRequestException(
        `Invalid job status. Allowed values: ${Object.values(JobStatus).join(', ')}`,
      );
    }
  }

  private validateRolesForTrade(trade: LabourTrade, roles: LabourRole[]) {
    if (!roles?.length) {
      throw new BadRequestException(
        `At least one role is required for trade "${trade}"`,
      );
    }

    const allowedRoles = LabourRolesByTrade[trade] ?? [];
    const invalidRoles = roles.filter((role) => !allowedRoles.includes(role));
    if (invalidRoles.length) {
      throw new BadRequestException(
        `Role(s) "${invalidRoles.join('", "')}" are not valid for trade "${trade}"`,
      );
    }
  }

  private validateCreatePayload(dto: CreateJobPostingDto) {
    if (!dto.title?.trim()) {
      throw new BadRequestException('Job title is required');
    }
    if (!Object.values(LabourTrade).includes(dto.trade)) {
      throw new BadRequestException('Invalid trade category');
    }
    this.validateJobType(dto.jobType);
    this.validateRolesForTrade(dto.trade, dto.roles);
    if (dto.hourlyWage == null || Number(dto.hourlyWage) <= 0) {
      throw new BadRequestException('Hourly wage must be greater than 0');
    }
    if (dto.positionsAvailable != null && Number(dto.positionsAvailable) < 1) {
      throw new BadRequestException('Positions available must be at least 1');
    }
    if (!dto.streetAddress?.trim() || !dto.zipCode?.trim() || !dto.location?.trim()) {
      throw new BadRequestException('Street address, zip code, and location are required');
    }
    if (!dto.startTime?.trim() || !dto.endTime?.trim()) {
      throw new BadRequestException('Start time and end time are required');
    }
    this.validateTime(dto.startTime, 'startTime');
    this.validateTime(dto.endTime, 'endTime');
    this.validateStatus(dto.status ?? JobStatus.OPEN);
    if (dto.skillLevel && !Object.values(SkillLevel).includes(dto.skillLevel)) {
      throw new BadRequestException('Invalid skill level');
    }
    if (dto.experience && !Object.values(ExperienceRange).includes(dto.experience)) {
      throw new BadRequestException('Invalid experience range');
    }
  }

  private async getCompanyOrganization(userId: number) {
    const organization = await this.organizationService.findByUserId(userId);
    if (!organization) {
      throw new ForbiddenException('Company profile not found for this user');
    }
    return organization;
  }

  private assertCompanyRole(role: string) {
    if (role !== Role.COMPANY) {
      throw new ForbiddenException('Only company accounts can manage job postings');
    }
  }

  private async assertJobOwner(job: JobPosting, userId: number) {
    const organization = job.organization;
    if (!organization?.user || organization.user.id !== userId) {
      throw new ForbiddenException('You can only manage your own job postings');
    }
  }

  private toJobResponse(job: JobPosting) {
    const organization = job.organization;

    return {
      success: true,
      id: job.id,
      title: job.title,
      description: job.description,
      trade: job.trade,
      roles: job.roles,
      skillLevel: job.skillLevel,
      experience: job.experience,
      jobType: job.jobType,
      hourlyWage: Number(job.hourlyWage),
      positionsAvailable: job.positionsAvailable,
      streetAddress: job.streetAddress,
      zipCode: job.zipCode,
      location: job.location,
      state: job.state,
      county: job.county,
      startTime: job.startTime,
      endTime: job.endTime,
      startDate: this.formatDate(job.startDate),
      endDate: this.formatDate(job.endDate),
      status: job.status,
      company: organization
        ? {
            id: organization.id,
            companyName: organization.companyName,
            contactPerson: organization.contactPerson,
            streetAddress: organization.address,
            zipCode: organization.zipCode,
            location: organization.location,
            county: organization.county,
          }
        : null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  async create(userId: number, role: string, dto: CreateJobPostingDto) {
    this.assertCompanyRole(role);

    const normalizedDto = this.normalizeCreateDto(dto);
    this.validateCreatePayload(normalizedDto);

    const organization = await this.getCompanyOrganization(userId);

    const job = this.jobPostingRepository.create({
      title: normalizedDto.title,
      description: normalizedDto.description ?? null,
      trade: normalizedDto.trade,
      roles: normalizedDto.roles,
      skillLevel: normalizedDto.skillLevel ?? null,
      experience: normalizedDto.experience ?? null,
      jobType: normalizedDto.jobType,
      hourlyWage: normalizedDto.hourlyWage,
      positionsAvailable: normalizedDto.positionsAvailable ?? 1,
      streetAddress: normalizedDto.streetAddress,
      zipCode: normalizedDto.zipCode,
      location: normalizedDto.location,
      state: normalizedDto.state ?? null,
      county: normalizedDto.county ?? null,
      startTime: normalizedDto.startTime,
      endTime: normalizedDto.endTime,
      startDate: this.parseOptionalDate(normalizedDto.startDate),
      endDate: this.parseOptionalDate(normalizedDto.endDate),
      status: normalizedDto.status ?? JobStatus.OPEN,
      organization,
    });

    const saved = await this.jobPostingRepository.save(job);
    return this.findOne(saved.id);
  }

  async findAllPublic(search?: JobPostingSearchDto) {
    const { page, limit, skip } = this.resolvePagination(search);

    const qb = this.jobPostingRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.organization', 'organization')
      .leftJoinAndSelect('organization.user', 'user')
      .where('job.status = :status', { status: JobStatus.OPEN })
      .andWhere('job.isActive = :isActive', { isActive: true });

    this.applyPublicJobSearch(qb, search);

    const [jobs, total] = await qb
      .orderBy('job.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: jobs.map((job) => this.toJobResponse(job)),
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

  async findAllByCompany(
    userId: number,
    role: string,
    pagination?: JobPostingPaginationDto,
  ) {
    this.assertCompanyRole(role);
    const organization = await this.getCompanyOrganization(userId);
    const { page, limit, skip } = this.resolvePagination(pagination);

    const where: { organization: { id: number }; status?: JobStatus } = {
      organization: { id: organization.id },
    };
    if (pagination?.status) {
      this.validateStatus(pagination.status);
      where.status = pagination.status;
    }

    const [jobs, total] = await this.jobPostingRepository.findAndCount({
      where,
      relations: ['organization', 'organization.user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: jobs.map((job) => this.toJobResponse(job)),
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
    const job = await this.jobPostingRepository.findOne({
      where: { id },
      relations: ['organization', 'organization.user'],
    });
    if (!job) {
      throw new NotFoundException('Job posting not found');
    }
    return this.toJobResponse(job);
  }

  async update(
    id: number,
    userId: number,
    role: string,
    dto: UpdateJobPostingDto,
  ) {
    this.assertCompanyRole(role);

    const job = await this.jobPostingRepository.findOne({
      where: { id },
      relations: ['organization', 'organization.user'],
    });
    if (!job) {
      throw new NotFoundException('Job posting not found');
    }

    await this.assertJobOwner(job, userId);

    const trade = dto.trade ?? job.trade;
    const roles = dto.roles ?? job.roles;

    if (dto.trade || dto.roles) {
      this.validateRolesForTrade(trade, roles);
    }
    if (dto.jobType) {
      this.validateJobType(dto.jobType);
    }
    if (dto.status) {
      this.validateStatus(dto.status);
    }
    if (dto.startTime) {
      this.validateTime(dto.startTime, 'startTime');
    }
    if (dto.endTime) {
      this.validateTime(dto.endTime, 'endTime');
    }
    if (dto.hourlyWage != null && Number(dto.hourlyWage) <= 0) {
      throw new BadRequestException('Hourly wage must be greater than 0');
    }

    await this.jobPostingRepository.update(id, {
      ...(dto.title && { title: dto.title.trim() }),
      ...(dto.description !== undefined && {
        description: this.normalizeOptionalString(dto.description),
      }),
      ...(dto.trade && { trade: dto.trade }),
      ...(dto.roles && { roles: dto.roles }),
      ...(dto.skillLevel !== undefined && {
        skillLevel: dto.skillLevel || null,
      }),
      ...(dto.experience !== undefined && {
        experience: dto.experience || null,
      }),
      ...(dto.jobType && { jobType: dto.jobType }),
      ...(dto.hourlyWage != null && { hourlyWage: dto.hourlyWage }),
      ...(dto.positionsAvailable != null && {
        positionsAvailable: dto.positionsAvailable,
      }),
      ...(dto.streetAddress && { streetAddress: dto.streetAddress.trim() }),
      ...(dto.zipCode && { zipCode: dto.zipCode.trim() }),
      ...(dto.location && { location: dto.location.trim() }),
      ...(dto.state !== undefined && {
        state: this.normalizeOptionalString(dto.state),
      }),
      ...(dto.county !== undefined && {
        county: this.normalizeOptionalString(dto.county),
      }),
      ...(dto.startTime && { startTime: dto.startTime }),
      ...(dto.endTime && { endTime: dto.endTime }),
      ...(dto.startDate !== undefined && {
        startDate: this.parseOptionalDate(dto.startDate),
      }),
      ...(dto.endDate !== undefined && {
        endDate: this.parseOptionalDate(dto.endDate),
      }),
      ...(dto.status && { status: dto.status }),
    });

    return this.findOne(id);
  }

  async remove(id: number, userId: number, role: string) {
    this.assertCompanyRole(role);

    const job = await this.jobPostingRepository.findOne({
      where: { id },
      relations: ['organization', 'organization.user'],
    });
    if (!job) {
      throw new NotFoundException('Job posting not found');
    }

    await this.assertJobOwner(job, userId);
    await this.jobPostingRepository.remove(job);

    return { success: true, message: 'Job posting deleted' };
  }
}
