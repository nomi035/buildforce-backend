import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabourProfile } from 'src/labour-profile/entities/labour-profile.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, LabourProfile])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService] // Exporting the service to be used in other modules
})
export class UserModule {}
