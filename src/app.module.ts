import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { LabourProfileModule } from './labour-profile/labour-profile.module';
import { PhoneVerificationModule } from './phone-verification/phone-verification.module';

@Module({
  imports: [UserModule,
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
     AuthModule,
     OrganizationModule,
     LabourProfileModule,
     PhoneVerificationModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
