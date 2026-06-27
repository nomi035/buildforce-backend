import { WorkforceRequirement } from '../enums/workforce-requirement.enum';

export class CompanyRegistrationDto {
  companyName: string;
  businessLicenseNumber: string;
  contactPerson: string;
  email: string;
  password: string;
  phone: string;
  streetAddress: string;
  zipCode: string;
  location: string;
  county: string;
  workforceRequirement: WorkforceRequirement;
  promoCode?: string;
}
