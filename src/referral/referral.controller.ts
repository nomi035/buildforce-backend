import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard';
import { ReferralPaginationDto } from './dto/referral-pagination.dto';
import { ReferralService } from './referral.service';
import { ReferralSwaggerSchema } from './referral.swagger-schema';

@Controller('referral')
@ApiTags('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('promo-code')
  @ApiOperation({
    summary: 'Generate a personal promo code',
    description:
      'Creates a unique promo code for the logged-in user (format: BF-XXXXXXXX). ' +
      'If the user already has a code, the existing one is returned. ' +
      'Share this code with others — when they sign up and pass `promoCode` in the registration body, ' +
      'this user\'s referral count increases.',
  })
  @ApiResponse(ReferralSwaggerSchema.generatePromoCodeResponse)
  generatePromoCode(@Req() req: { user: { userId: number } }) {
    return this.referralService.generatePromoCode(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get my referral dashboard',
    description:
      'Returns the authenticated user\'s promo code, total referral count, ' +
      'and the 5 most recent signups that used their code.',
  })
  @ApiResponse(ReferralSwaggerSchema.myReferralSummaryResponse)
  getMySummary(@Req() req: { user: { userId: number } }) {
    return this.referralService.getMyReferralSummary(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/referrals')
  @ApiOperation({
    summary: 'List all users I referred (paginated)',
    description:
      'Full paginated history of users who signed up using the authenticated user\'s promo code.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse(ReferralSwaggerSchema.referralListResponse)
  getMyReferrals(
    @Req() req: { user: { userId: number } },
    @Query() pagination: ReferralPaginationDto,
  ) {
    return this.referralService.getMyReferrals(req.user.userId, pagination);
  }

  @Get('validate/:code')
  @ApiOperation({
    summary: 'Validate a promo code (public)',
    description:
      'Call this before signup to check whether a promo code is valid. ' +
      'No authentication required. Use the returned referrer info to show "Referred by …" in the UI.',
  })
  @ApiParam({
    name: 'code',
    example: 'BF-A1B2C3D4',
    description: 'Promo code entered by the new user during registration',
  })
  @ApiResponse(ReferralSwaggerSchema.validatePromoCodeResponse)
  @ApiResponse(ReferralSwaggerSchema.invalidPromoCodeResponse)
  validatePromoCode(@Param('code') code: string) {
    return this.referralService.validatePromoCode(code);
  }
}
