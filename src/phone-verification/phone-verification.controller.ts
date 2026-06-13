import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { PhoneVerificationService } from './phone-verification.service';
import { PhoneVerificationSwaggerSchema } from './phone-verification.swagger-schema';

@Controller('phone-verification')
@ApiTags('phone-verification')
export class PhoneVerificationController {
  constructor(
    private readonly phoneVerificationService: PhoneVerificationService,
  ) {}

  @ApiBody(PhoneVerificationSwaggerSchema.sendCodeBody)
  @Post('send-code')
  sendCode(@Body() sendVerificationCodeDto: SendVerificationCodeDto) {
    return this.phoneVerificationService.sendCode(
      sendVerificationCodeDto.phone,
    );
  }

  @ApiBody(PhoneVerificationSwaggerSchema.verifyCodeBody)
  @Post('verify-code')
  verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.phoneVerificationService.verifyCode(
      verifyCodeDto.phone,
      verifyCodeDto.code,
    );
  }
}
