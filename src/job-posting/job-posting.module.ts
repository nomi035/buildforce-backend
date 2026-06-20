import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationModule } from 'src/organization/organization.module';
import { JobPosting } from './entities/job-posting.entity';
import { JobPostingController } from './job-posting.controller';
import { JobPostingService } from './job-posting.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting]), OrganizationModule],
  controllers: [JobPostingController],
  providers: [JobPostingService],
  exports: [JobPostingService],
})
export class JobPostingModule {}
