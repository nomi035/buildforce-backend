import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateLabourProfileDto } from './create-labour-profile.dto';

export class UpdateLabourProfileDto extends PartialType(
  OmitType(CreateLabourProfileDto, ['user', 'phoneVerificationToken'] as const),
) {}
