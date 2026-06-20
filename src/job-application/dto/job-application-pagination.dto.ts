import { ApplicationStatus } from '../enums/application-status.enum';

export class JobApplicationPaginationDto {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
}
