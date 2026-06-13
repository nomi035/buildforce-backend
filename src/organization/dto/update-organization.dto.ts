import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(
  OmitType(CreateOrganizationDto, ['userId'] as const),
) {}
