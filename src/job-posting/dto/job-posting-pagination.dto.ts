import { JobStatus } from '../enums/job-status.enum';

export class JobPostingPaginationDto {
  page?: number;
  limit?: number;
  status?: JobStatus;
}
