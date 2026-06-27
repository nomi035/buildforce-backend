import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { TrainingEnrollment } from './entities/training-enrollment.entity';
import { TrainingProgram } from './entities/training-program.entity';
import { UserCertificate } from './entities/user-certificate.entity';
import { TrainingCertificateController } from './training-certificate.controller';
import { TrainingCertificateService } from './training-certificate.service';
import { TrainingProgramController } from './training-program.controller';
import { TrainingProgramService } from './training-program.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingProgram,
      TrainingEnrollment,
      UserCertificate,
      User,
    ]),
  ],
  controllers: [TrainingProgramController, TrainingCertificateController],
  providers: [TrainingProgramService, TrainingCertificateService],
  exports: [TrainingProgramService, TrainingCertificateService],
})
export class TrainingModule {}
