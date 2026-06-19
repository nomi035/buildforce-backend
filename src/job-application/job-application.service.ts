import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { JobStatus } from 'src/job-posting/enums/job-status.enum';
import { Role, User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationPaginationDto } from './dto/job-application-pagination.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JobApplication } from './entities/job-application.entity';
import { ApplicationStatus } from './enums/application-status.enum';

@Injectable()
export class JobApplicationService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly jobApplicationRepository: Repository<JobApplication>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
    private readonly userService: UserService,
  ) {}

  private resolvePagination(pagination?: JobApplicationPaginationDto) {
    const page = Math.max(Number(pagination?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private assertLabourRole(role: string) {
    if (role !== Role.LABOUR) {
      throw new ForbiddenException('Only labour accounts can apply to jobs');
    }
  }

  private assertCompanyRole(role: string) {
    if (role !== Role.COMPANY) {
      throw new ForbiddenException('Only company accounts can manage applications');
    }
  }

  private validateStatus(status: ApplicationStatus) {
    if (!Object.values(ApplicationStatus).includes(status)) {
      throw new BadRequestException(
        `Invalid status. Allowed: ${Object.values(ApplicationStatus).join(', ')}`,
      );
    }
  }

  private formatDate(value?: Date | string | null) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  }

  private toJobSummary(job: JobPosting) {
    const organization = job.organization;

    return {
      id: job.id,
      title: job.title,
      trade: job.trade,
      roles: job.roles,
      jobType: job.jobType,
      hourlyWage: Number(job.hourlyWage),
      location: job.location,
      zipCode: job.zipCode,
      county: job.county,
      status: job.status,
      company: organization
        ? {
            id: organization.id,
            companyName: organization.companyName,
            location: organization.location,
            county: organization.county,
          }
        : null,
    };
  }

  private async toApplicantSummary(applicant: User) {
    const labourProfile = await this.userService.findLabourProfileByUserId(
      applicant.id,
    );

    return {
      id: applicant.id,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      labourProfileId: labourProfile?.id ?? null,
      trade: labourProfile?.trade ?? null,
      roles: labourProfile?.roles ?? [],
      skillLevel: labourProfile?.skillLevel ?? null,
      experience: labourProfile?.experience ?? null,
      location: labourProfile?.location ?? null,
      zipCode: labourProfile?.zipCode ?? null,
      county: labourProfile?.county ?? null,
    };
  }

  private async toApplicationResponse(application: JobApplication) {
    const applicant = application.applicant;
    const job = application.jobPosting;

    return {
      success: true,
      id: application.id,
      status: application.status,
      coverNote: application.coverNote,
      companyNote: application.companyNote,
      job: job ? this.toJobSummary(job) : null,
      applicant: applicant ? await this.toApplicantSummary(applicant) : null,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  private async loadApplication(id: number) {
    const application = await this.jobApplicationRepository.findOne({
      where: { id },
      relations: [
        'jobPosting',
        'jobPosting.organization',
        'jobPosting.organization.user',
        'applicant',
      ],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  private assertCompanyOwnsJob(job: JobPosting, userId: number) {
    const ownerId = job.organization?.user?.id;
    if (!ownerId || ownerId !== userId) {
      throw new ForbiddenException('You can only view applications for your own jobs');
    }
  }

  private assertCanViewApplication(
    application: JobApplication,
    userId: number,
    role: string,
  ) {
    const isApplicant = application.applicant?.id === userId;
    const isCompanyOwner =
      role === Role.COMPANY &&
      application.jobPosting?.organization?.user?.id === userId;

    if (!isApplicant && !isCompanyOwner) {
      throw new ForbiddenException('You cannot view this application');
    }
  }

  async apply(userId: number, role: string, dto: CreateJobApplicationDto) {
    this.assertLabourRole(role);

    if (!dto.jobPostingId) {
      throw new BadRequestException('jobPostingId is required');
    }

    const job = await this.jobPostingRepository.findOne({
      where: { id: dto.jobPostingId },
      relations: ['organization', 'organization.user'],
    });

    if (!job) {
      throw new NotFoundException('Job posting not found');
    }

    if (job.status !== JobStatus.OPEN || !job.isActive) {
      throw new BadRequestException('This job is not accepting applications');
    }

    const labourProfile = await this.userService.findLabourProfileByUserId(userId);
    if (!labourProfile) {
      throw new BadRequestException('Labour profile required before applying');
    }

    const existing = await this.jobApplicationRepository.findOne({
      where: {
        jobPosting: { id: dto.jobPostingId },
        applicant: { id: userId },
      },
    });

    if (existing) {
      if (existing.status === ApplicationStatus.WITHDRAWN) {
        existing.status = ApplicationStatus.PENDING;
        existing.coverNote = dto.coverNote?.trim() ?? existing.coverNote;
        existing.companyNote = null;
        const saved = await this.jobApplicationRepository.save(existing);
        return this.loadAndRespond(saved.id);
      }
      throw new ConflictException('You have already applied to this job');
    }

    const application = this.jobApplicationRepository.create({
      jobPosting: job,
      applicant: { id: userId } as User,
      coverNote: dto.coverNote?.trim() ?? null,
      status: ApplicationStatus.PENDING,
    });

    const saved = await this.jobApplicationRepository.save(application);
    return this.loadAndRespond(saved.id);
  }

  async findMyApplications(userId: number, role: string, pagination?: JobApplicationPaginationDto) {
    this.assertLabourRole(role);
    const { page, limit, skip } = this.resolvePagination(pagination);

    const qb = this.jobApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.jobPosting', 'job')
      .leftJoinAndSelect('job.organization', 'organization')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .where('applicant.id = :userId', { userId })
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (pagination?.status) {
      this.validateStatus(pagination.status);
      qb.andWhere('application.status = :status', { status: pagination.status });
    }

    const [applications, total] = await qb.getManyAndCount();
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const data = await Promise.all(
      applications.map((application) => this.toApplicationResponse(application)),
    );

    return {
      data,
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

  async findByCompany(userId: number, role: string, pagination?: JobApplicationPaginationDto) {
    this.assertCompanyRole(role);
    const { page, limit, skip } = this.resolvePagination(pagination);

    const qb = this.jobApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.jobPosting', 'job')
      .leftJoinAndSelect('job.organization', 'organization')
      .leftJoinAndSelect('organization.user', 'companyUser')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .where('companyUser.id = :userId', { userId })
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (pagination?.status) {
      this.validateStatus(pagination.status);
      qb.andWhere('application.status = :status', { status: pagination.status });
    }

    const [applications, total] = await qb.getManyAndCount();
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const data = await Promise.all(
      applications.map((application) => this.toApplicationResponse(application)),
    );

    return {
      data,
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

  async findByJobPosting(
    jobPostingId: number,
    userId: number,
    role: string,
    pagination?: JobApplicationPaginationDto,
  ) {
    this.assertCompanyRole(role);

    const job = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId },
      relations: ['organization', 'organization.user'],
    });

    if (!job) {
      throw new NotFoundException('Job posting not found');
    }

    this.assertCompanyOwnsJob(job, userId);

    const { page, limit, skip } = this.resolvePagination(pagination);

    const qb = this.jobApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.jobPosting', 'job')
      .leftJoinAndSelect('job.organization', 'organization')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .where('job.id = :jobPostingId', { jobPostingId })
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (pagination?.status) {
      this.validateStatus(pagination.status);
      qb.andWhere('application.status = :status', { status: pagination.status });
    }

    const [applications, total] = await qb.getManyAndCount();
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const data = await Promise.all(
      applications.map((application) => this.toApplicationResponse(application)),
    );

    return {
      data,
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

  async findOne(id: number, userId: number, role: string) {
    const application = await this.loadApplication(id);
    this.assertCanViewApplication(application, userId, role);
    return this.toApplicationResponse(application);
  }

  async updateStatus(
    id: number,
    userId: number,
    role: string,
    dto: UpdateApplicationStatusDto,
  ) {
    this.validateStatus(dto.status);

    const application = await this.loadApplication(id);
    const isApplicant = application.applicant?.id === userId;
    const isCompanyOwner =
      role === Role.COMPANY &&
      application.jobPosting?.organization?.user?.id === userId;

    if (dto.status === ApplicationStatus.WITHDRAWN) {
      this.assertLabourRole(role);
      if (!isApplicant) {
        throw new ForbiddenException('Only the applicant can withdraw');
      }
      if (
        application.status !== ApplicationStatus.PENDING &&
        application.status !== ApplicationStatus.REVIEWING
      ) {
        throw new BadRequestException('Cannot withdraw this application');
      }
    } else {
      this.assertCompanyRole(role);
      if (!isCompanyOwner) {
        throw new ForbiddenException('Only the job company can update application status');
      }
      const companyAllowed = [
        ApplicationStatus.REVIEWING,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
      ];
      if (!companyAllowed.includes(dto.status)) {
        throw new BadRequestException('Invalid status update for company');
      }
    }

    application.status = dto.status;
    if (dto.companyNote !== undefined && role === Role.COMPANY) {
      application.companyNote = dto.companyNote?.trim() ?? null;
    }

    await this.jobApplicationRepository.save(application);
    return this.loadAndRespond(id);
  }

  private async loadAndRespond(id: number) {
    const application = await this.loadApplication(id);
    return this.toApplicationResponse(application);
  }
}
