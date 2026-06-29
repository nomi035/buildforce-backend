import { Role } from 'src/user/entities/user.entity';
import { ReferralPaginationDto } from './referral-pagination.dto';

export class ReferralAdminDashboardDto extends ReferralPaginationDto {
  /** Filter referrers by role — default `labour` when omitted */
  role?: Role;
}
