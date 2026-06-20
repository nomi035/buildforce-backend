import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from 'src/organization/entities/organization.entity';
import { User } from 'src/user/entities/user.entity';
import { CompanyRegistrationController } from './company-registration.controller';
import { CompanyRegistrationService } from './company-registration.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User])],
  controllers: [CompanyRegistrationController],
  providers: [CompanyRegistrationService],
})
export class CompanyRegistrationModule {}
