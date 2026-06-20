import { ApplicationStatus } from '../enums/application-status.enum';

export class UpdateApplicationStatusDto {
  status: ApplicationStatus;
  companyNote?: string;
}
