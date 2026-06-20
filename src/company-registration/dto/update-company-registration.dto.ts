import { PartialType } from '@nestjs/mapped-types';
import { CompanyRegistrationDto } from './company-registration.dto';

export class UpdateCompanyRegistrationDto extends PartialType(
  CompanyRegistrationDto,
) {}
