import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { UserModule } from 'src/user/user.module';
import { JobApplication } from './entities/job-application.entity';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, JobPosting]),
    UserModule,
  ],
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
