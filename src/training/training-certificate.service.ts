import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserCertificateDto } from './dto/create-user-certificate.dto';
import { TrainingPaginationDto } from './dto/training-pagination.dto';
import { TrainingProgram } from './entities/training-program.entity';
import { UserCertificate } from './entities/user-certificate.entity';
import { CertificateStatus } from './enums/certificate-status.enum';
import { generateCertificateNumber } from './utils/certificate-number.util';

@Injectable()
export class TrainingCertificateService {
  constructor(
    @InjectRepository(UserCertificate)
    private readonly certificateRepository: Repository<UserCertificate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TrainingProgram)
    private readonly programRepository: Repository<TrainingProgram>,
  ) {}

  private assertAdmin(role?: string) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admin accounts can manage certificates');
    }
  }

  private resolvePagination(pagination?: TrainingPaginationDto) {
    const page = Math.max(Number(pagination?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private parseDate(value: string, field: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${field}`);
    }
    return date;
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

  private resolveStatus(
    status: CertificateStatus | undefined,
    expiryDate: Date,
  ): CertificateStatus {
    if (status === CertificateStatus.EXPIRED) {
      return CertificateStatus.EXPIRED;
    }
    if (expiryDate.getTime() < Date.now()) {
      return CertificateStatus.EXPIRED;
    }
    return CertificateStatus.VALID;
  }

  private toCertificateResponse(certificate: UserCertificate) {
    return {
      success: true,
      id: certificate.id,
      title: certificate.title,
      certificateNumber: certificate.certificateNumber,
      issuedDate: this.formatDate(certificate.issuedDate),
      expiryDate: this.formatDate(certificate.expiryDate),
      status: certificate.status,
      user: certificate.user
        ? {
            id: certificate.user.id,
            name: certificate.user.name,
            email: certificate.user.email,
          }
        : null,
      program: certificate.program
        ? {
            id: certificate.program.id,
            title: certificate.program.title,
            type: certificate.program.type,
          }
        : null,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt,
    };
  }

  async create(role: string, dto: CreateUserCertificateDto) {
    this.assertAdmin(role);

    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let program: TrainingProgram | null = null;
    if (dto.programId) {
      program = await this.programRepository.findOne({
        where: { id: dto.programId },
      });
      if (!program) {
        throw new NotFoundException('Training program not found');
      }
    }

    if (!dto.title?.trim()) {
      throw new BadRequestException('Title is required');
    }

    const issuedDate = this.parseDate(dto.issuedDate, 'issuedDate');
    const expiryDate = this.parseDate(dto.expiryDate, 'expiryDate');

    if (expiryDate.getTime() <= issuedDate.getTime()) {
      throw new BadRequestException('expiryDate must be after issuedDate');
    }

    let certificateNumber = generateCertificateNumber();
    let attempts = 0;
    while (
      (await this.certificateRepository.findOne({ where: { certificateNumber } })) &&
      attempts < 10
    ) {
      certificateNumber = generateCertificateNumber();
      attempts += 1;
    }

    const status = this.resolveStatus(dto.status, expiryDate);

    const certificate = this.certificateRepository.create({
      user,
      program: program ?? undefined,
      title: dto.title.trim(),
      certificateNumber,
      issuedDate,
      expiryDate,
      status,
    });

    const saved = await this.certificateRepository.save(certificate);
    return this.findOne(saved.id);
  }

  async findOne(id: number) {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: ['user', 'program'],
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return this.toCertificateResponse(certificate);
  }

  async findMyCertificates(userId: number) {
    const certificates = await this.certificateRepository.find({
      where: { user: { id: userId }, isActive: true },
      relations: ['user', 'program'],
      order: { issuedDate: 'DESC' },
    });

    return {
      success: true,
      data: certificates.map((certificate) => this.toCertificateResponse(certificate)),
      total: certificates.length,
    };
  }

  async findAllAdmin(role: string, pagination?: TrainingPaginationDto) {
    this.assertAdmin(role);
    const { page, limit, skip } = this.resolvePagination(pagination);

    const [certificates, total] = await this.certificateRepository.findAndCount({
      relations: ['user', 'program'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: certificates.map((certificate) => this.toCertificateResponse(certificate)),
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
}
