import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LabourProfile } from 'src/labour-profile/entities/labour-profile.entity';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(LabourProfile)
    private readonly labourProfileRepository: Repository<LabourProfile>,
    private readonly dataSource: DataSource,
  ) {}
async  create(createUserDto: CreateUserDto) {
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
    return await this.usersRepository.findOne({where:{id}});
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
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
