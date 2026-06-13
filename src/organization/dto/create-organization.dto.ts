export class CreateOrganizationDto {
  companyName: string;
  registrationNumber?: string;
  industry?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  userId: number;
}
