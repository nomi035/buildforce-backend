import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LabourProfile } from 'src/labour-profile/entities/labour-profile.entity';
import { S3Service } from 'src/s3/s3.service';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { IMAGE_MIME_TYPES, VIDEO_MIME_TYPES } from './multer.config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(LabourProfile)
    private readonly labourProfileRepository: Repository<LabourProfile>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  private assertImageFile(file: Express.Multer.File, field: string) {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `${field} must be a JPEG, PNG, or WebP image`,
      );
    }
  }

  private assertVideoFile(file: Express.Multer.File) {
    if (!VIDEO_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Intro video must be MP4, MOV, WebM, or MPEG format',
      );
    }
  }

  async create(createUserDto: CreateUserDto) {
    return await this.usersRepository.save(createUserDto);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailOrPhone(emailOrPhone: string) {
    const identifier = emailOrPhone.trim();
    return this.usersRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });
  }

  async findLabourProfileByUserId(userId: number) {
    return this.labourProfileRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
  }

  async uploadGovernmentId(
    userId: number,
    front?: Express.Multer.File,
    back?: Express.Multer.File,
  ) {
    if (!front && !back) {
      throw new BadRequestException(
        'At least one of governmentIdFront or governmentIdBack is required',
      );
    }

    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (front) {
      this.assertImageFile(front, 'governmentIdFront');
    }
    if (back) {
      this.assertImageFile(back, 'governmentIdBack');
    }

    const updates: Partial<User> = {};

    if (front) {
      if (user.governmentIdFront) {
        await this.s3Service.deleteByUrl(user.governmentIdFront);
      }
      updates.governmentIdFront = await this.s3Service.uploadFile(
        front,
        `users/${userId}/government-id`,
      );
    }

    if (back) {
      if (user.governmentIdBack) {
        await this.s3Service.deleteByUrl(user.governmentIdBack);
      }
      updates.governmentIdBack = await this.s3Service.uploadFile(
        back,
        `users/${userId}/government-id`,
      );
    }

    await this.usersRepository.update(userId, updates);
    return this.findOne(userId);
  }

  async uploadIntroVideo(userId: number, video: Express.Multer.File) {
    if (!video) {
      throw new BadRequestException('introVideo file is required');
    }

    this.assertVideoFile(video);

    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.introVideo) {
      await this.s3Service.deleteByUrl(user.introVideo);
    }

    const introVideo = await this.s3Service.uploadFile(
      video,
      `users/${userId}/intro-video`,
    );

    await this.usersRepository.update(userId, { introVideo });
    return this.findOne(userId);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const labourProfile = await manager.findOne(LabourProfile, {
        where: { user: { id } },
      });
      if (labourProfile) {
        await manager.remove(LabourProfile, labourProfile);
      }
      await manager.delete(User, id);
    });
  }
}
