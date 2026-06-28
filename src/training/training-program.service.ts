import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { EnrollTrainingProgramDto } from './dto/enroll-training-program.dto';
import { TrainingPaginationDto } from './dto/training-pagination.dto';
import { UpdateTrainingProgramDto } from './dto/update-training-program.dto';
import { TrainingEnrollment } from './entities/training-enrollment.entity';
import { TrainingProgram } from './entities/training-program.entity';
import { TrainingLevel } from './enums/training-level.enum';
import { TrainingProgramType } from './enums/training-program-type.enum';

@Injectable()
export class TrainingProgramService {
  constructor(
    @InjectRepository(TrainingProgram)
    private readonly programRepository: Repository<TrainingProgram>,
    @InjectRepository(TrainingEnrollment)
    private readonly enrollmentRepository: Repository<TrainingEnrollment>,
  ) {}

  private assertAdmin(role?: string) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admin accounts can manage training programs');
    }
  }

  private resolvePagination(pagination?: TrainingPaginationDto) {
    const page = Math.max(Number(pagination?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
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

  private validateProgramType(type: TrainingProgramType) {
    if (!Object.values(TrainingProgramType).includes(type)) {
      throw new BadRequestException(
        `Invalid type. Allowed: ${Object.values(TrainingProgramType).join(', ')}`,
      );
    }
  }

  private validateLevel(level?: TrainingLevel) {
    if (level && !Object.values(TrainingLevel).includes(level)) {
      throw new BadRequestException(
        `Invalid level. Allowed: ${Object.values(TrainingLevel).join(', ')}`,
      );
    }
  }

  private validateCreatePayload(dto: CreateTrainingProgramDto) {
    this.validateProgramType(dto.type);
    if (!dto.title?.trim()) {
      throw new BadRequestException('Title is required');
    }
    if (dto.price == null || Number(dto.price) < 0) {
      throw new BadRequestException('Price must be 0 or greater');
    }

    if (dto.type === TrainingProgramType.COURSE) {
      if (!dto.durationHours || dto.durationHours < 1) {
        throw new BadRequestException('Courses require durationHours (min 1)');
      }
      this.validateLevel(dto.level);
      if (!dto.level) {
        throw new BadRequestException('Courses require a level');
      }
      if (!dto.location?.trim()) {
        throw new BadRequestException('Courses require location');
      }
    }

    if (dto.type === TrainingProgramType.WORKSHOP) {
      if (!dto.eventDate?.trim()) {
        throw new BadRequestException('Workshops require eventDate');
      }
      if (!dto.location?.trim()) {
        throw new BadRequestException('Workshops require location');
      }
      if (!dto.totalSpots || dto.totalSpots < 1) {
        throw new BadRequestException('Workshops require totalSpots (min 1)');
      }
    }
  }

  private async getEnrollmentCount(programId: number) {
    return this.enrollmentRepository.count({
      where: { program: { id: programId }, isActive: true },
    });
  }

  private toProgramResponse(program: TrainingProgram, enrolledCount: number) {
    const spotsLeft =
      program.type === TrainingProgramType.WORKSHOP && program.totalSpots != null
        ? Math.max(program.totalSpots - enrolledCount, 0)
        : null;

    return {
      success: true,
      id: program.id,
      type: program.type,
      title: program.title,
      description: program.description,
      durationHours: program.durationHours,
      level: program.level,
      eventDate: this.formatDate(program.eventDate),
      location: program.location,
      price: Number(program.price),
      totalSpots: program.totalSpots,
      enrolledCount,
      spotsLeft,
      isActive: program.isActive,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    };
  }

  async create(role: string, dto: CreateTrainingProgramDto) {
    this.assertAdmin(role);
    this.validateCreatePayload(dto);

    const program = this.programRepository.create({
      type: dto.type,
      title: dto.title.trim(),
      description: dto.description?.trim() ?? null,
      durationHours: dto.durationHours ?? null,
      level: dto.level ?? null,
      eventDate: this.parseOptionalDate(dto.eventDate),
      location: dto.location?.trim() ?? null,
      price: dto.price,
      totalSpots: dto.totalSpots ?? null,
    });

    const saved = await this.programRepository.save(program);
    return this.toProgramResponse(saved, 0);
  }

  async findAllPublic(type?: TrainingProgramType, pagination?: TrainingPaginationDto) {
    if (type) {
      this.validateProgramType(type);
    }

    const { page, limit, skip } = this.resolvePagination(pagination);

    const qb = this.programRepository
      .createQueryBuilder('program')
      .where('program.isActive = :isActive', { isActive: true });

    if (type) {
      qb.andWhere('program.type = :type', { type });
    }

    const [programs, total] = await qb
      .orderBy('program.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = await Promise.all(
      programs.map(async (program) => {
        const enrolledCount = await this.getEnrollmentCount(program.id);
        return this.toProgramResponse(program, enrolledCount);
      }),
    );

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

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

  async findAllAdmin(role: string, pagination?: TrainingPaginationDto) {
    this.assertAdmin(role);
    const { page, limit, skip } = this.resolvePagination(pagination);

    const [programs, total] = await this.programRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const data = await Promise.all(
      programs.map(async (program) => {
        const enrolledCount = await this.getEnrollmentCount(program.id);
        return this.toProgramResponse(program, enrolledCount);
      }),
    );

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

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

  async findOne(id: number) {
    const program = await this.programRepository.findOne({ where: { id } });
    if (!program || !program.isActive) {
      throw new NotFoundException('Training program not found');
    }

    const enrolledCount = await this.getEnrollmentCount(program.id);
    return this.toProgramResponse(program, enrolledCount);
  }

  async update(id: number, role: string, dto: UpdateTrainingProgramDto) {
    this.assertAdmin(role);

    const program = await this.programRepository.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException('Training program not found');
    }

    if (dto.level) {
      this.validateLevel(dto.level);
    }
    if (dto.price != null && Number(dto.price) < 0) {
      throw new BadRequestException('Price must be 0 or greater');
    }

    await this.programRepository.update(id, {
      ...(dto.title && { title: dto.title.trim() }),
      ...(dto.description !== undefined && {
        description: dto.description?.trim() ?? null,
      }),
      ...(dto.durationHours != null && { durationHours: dto.durationHours }),
      ...(dto.level && { level: dto.level }),
      ...(dto.eventDate !== undefined && {
        eventDate: this.parseOptionalDate(dto.eventDate),
      }),
      ...(dto.location !== undefined && {
        location: dto.location?.trim() ?? null,
      }),
      ...(dto.price != null && { price: dto.price }),
      ...(dto.totalSpots != null && { totalSpots: dto.totalSpots }),
      ...(dto.isActive != null && { isActive: dto.isActive }),
    });

    const updated = await this.programRepository.findOne({ where: { id } });
    const enrolledCount = await this.getEnrollmentCount(id);
    return this.toProgramResponse(updated!, enrolledCount);
  }

  async remove(id: number, role: string) {
    this.assertAdmin(role);

    const program = await this.programRepository.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException('Training program not found');
    }

    await this.programRepository.remove(program);
    return { success: true, message: 'Training program deleted' };
  }

  async enroll(
    programId: number,
    dto: EnrollTrainingProgramDto,
    user?: { userId: number; role: string } | null,
  ) {
    const program = await this.programRepository.findOne({
      where: { id: programId, isActive: true },
    });
    if (!program) {
      throw new NotFoundException('Training program not found');
    }

    const enrolledCount = await this.getEnrollmentCount(programId);

    if (
      program.type === TrainingProgramType.WORKSHOP &&
      program.totalSpots != null &&
      enrolledCount >= program.totalSpots
    ) {
      throw new BadRequestException('This workshop is full');
    }

    if (user?.userId) {
      const existing = await this.enrollmentRepository.findOne({
        where: {
          program: { id: programId },
          user: { id: user.userId },
        },
      });
      if (existing) {
        throw new ConflictException('You are already enrolled in this program');
      }

      const enrollment = this.enrollmentRepository.create({
        program,
        user: { id: user.userId },
      });
      const saved = await this.enrollmentRepository.save(enrollment);

      return {
        success: true,
        enrollmentId: saved.id,
        programId: program.id,
        programTitle: program.title,
        enrolledAs: 'user',
        userId: user.userId,
        message: 'Enrolled successfully',
      };
    }

    const name = dto.name?.trim();
    const email = dto.email?.trim();
    const phone = dto.phone?.trim();

    if (!name || !email || !phone) {
      throw new BadRequestException(
        'Guest enrollment requires name, email, and phone',
      );
    }

    const existingGuest = await this.enrollmentRepository.findOne({
      where: {
        program: { id: programId },
        guestEmail: email,
      },
    });
    if (existingGuest) {
      throw new ConflictException('This email is already enrolled in this program');
    }

    const enrollment = this.enrollmentRepository.create({
      program,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
    });
    const saved = await this.enrollmentRepository.save(enrollment);

    return {
      success: true,
      enrollmentId: saved.id,
      programId: program.id,
      programTitle: program.title,
      enrolledAs: 'guest',
      guestName: name,
      guestEmail: email,
      message: 'Enrolled successfully',
    };
  }

  async findEnrollmentsAdmin(role: string, pagination?: TrainingPaginationDto) {
    this.assertAdmin(role);
    const { page, limit, skip } = this.resolvePagination(pagination);

    const [enrollments, total] = await this.enrollmentRepository.findAndCount({
      relations: ['program', 'user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: enrollments.map((enrollment) => ({
        id: enrollment.id,
        program: {
          id: enrollment.program.id,
          title: enrollment.program.title,
          type: enrollment.program.type,
        },
        user: enrollment.user
          ? {
              id: enrollment.user.id,
              name: enrollment.user.name,
              email: enrollment.user.email,
            }
          : null,
        guestName: enrollment.guestName,
        guestEmail: enrollment.guestEmail,
        guestPhone: enrollment.guestPhone,
        createdAt: enrollment.createdAt,
      })),
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
