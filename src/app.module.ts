import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CompanyRegistrationModule } from './company-registration/company-registration.module';
import { OrganizationModule } from './organization/organization.module';
import { LabourProfileModule } from './labour-profile/labour-profile.module';
import { JobPostingModule } from './job-posting/job-posting.module';
import { JobApplicationModule } from './job-application/job-application.module';
import { PhoneVerificationModule } from './phone-verification/phone-verification.module';
import { ReferralModule } from './referral/referral.module';

@Module({
  imports: [
    CompanyRegistrationModule,
    ConfigModule.forRoot(),
     TypeOrmModule.forRoot({
    type: 'postgres',
    // host: process.env.DB_HOST,
    // port: Number(process.env.DB_PORT),
    // database: process.env.DB_NAME,
    // username: process.env.DB_USER ,
    // password: process.env.DB_PASSWORD,
    url: process.env.DB_URL,
    autoLoadEntities: true,
    synchronize: true,
    //  ssl: {
    //  rejectUnauthorized: false,
    //  },
  }),
     UserModule,
     AuthModule,
     OrganizationModule,
     LabourProfileModule,
     JobPostingModule,
     JobApplicationModule,
     PhoneVerificationModule,
     ReferralModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
