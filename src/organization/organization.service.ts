import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly userService: UserService,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const user = await this.userService.findOne(createOrganizationDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.findByUserId(createOrganizationDto.userId);
    if (existing) {
      throw new ConflictException('Organization profile already exists for this user');
    }

    const organization = this.organizationRepository.create({
      ...createOrganizationDto,
      user: { id: createOrganizationDto.userId },
    });

    return this.organizationRepository.save(organization);
  }

  async findAll() {
    return this.organizationRepository.find({ relations: ['user'] });
  }

  async findOne(id: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async findByUserId(userId: number) {
    return this.organizationRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    await this.findOne(id);
    await this.organizationRepository.update(id, updateOrganizationDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const organization = await this.findOne(id);
    return this.organizationRepository.remove(organization);
  }
}
