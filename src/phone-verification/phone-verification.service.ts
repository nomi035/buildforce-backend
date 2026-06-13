import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Twilio } from 'twilio';
import { normalizeUsPhone } from './utils/phone.util';

@Injectable()
export class PhoneVerificationService {
  private readonly client: Twilio;
  private readonly verifyServiceSid: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.verifyServiceSid = this.configService.get<string>(
      'TWILIO_VERIFY_SERVICE_SID',
    );

    if (!accountSid || !authToken || !this.verifyServiceSid) {
      throw new InternalServerErrorException(
        'Twilio credentials are not configured',
      );
    }

    this.client = new Twilio(accountSid, authToken);
  }

  async sendCode(phone: string) {
    const normalizedPhone = normalizeUsPhone(phone);

    try {
      await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: normalizedPhone,
          channel: 'sms',
        });
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? 'Failed to send verification code',
      );
    }

    return {
      message: 'Verification code sent',
      phone: normalizedPhone,
    };
  }

  async verifyCode(phone: string, code: string) {
    const normalizedPhone = normalizeUsPhone(phone);

    let status: string;
    try {
      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: normalizedPhone,
          code,
        });
      status = verificationCheck.status;
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? 'Failed to verify code',
      );
    }

    if (status !== 'approved') {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const phoneVerificationToken = this.jwtService.sign({
      phone: normalizedPhone,
      purpose: 'phone_verification',
    });

    return {
      verified: true,
      phone: normalizedPhone,
      phoneVerificationToken,
    };
  }

  assertVerifiedPhone(token: string, phone: string) {
    const normalizedPhone = normalizeUsPhone(phone);

    try {
      const payload = this.jwtService.verify<{
        phone: string;
        purpose: string;
      }>(token);

      if (
        payload.purpose !== 'phone_verification' ||
        payload.phone !== normalizedPhone
      ) {
        throw new BadRequestException('Phone verification token is invalid');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Phone verification token is invalid or expired',
      );
    }
  }
}
