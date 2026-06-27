import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralModule } from 'src/referral/referral.module';
import { PhoneVerificationModule } from 'src/phone-verification/phone-verification.module';
import { User } from 'src/user/entities/user.entity';
import { LabourProfile } from './entities/labour-profile.entity';
import { LabourProfileController } from './labour-profile.controller';
import { LabourProfileService } from './labour-profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LabourProfile, User]),
    PhoneVerificationModule,
    ReferralModule,
  ],
  controllers: [LabourProfileController],
  providers: [LabourProfileService],
  exports: [LabourProfileService],
})
export class LabourProfileModule {}
