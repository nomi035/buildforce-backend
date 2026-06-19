import { JobPostingPaginationDto } from './job-posting-pagination.dto';

export class JobPostingSearchDto extends JobPostingPaginationDto {
  /** General search — title, company, trade, location, etc. (min 3 chars) */
  query?: string;

  /** City or area (min 3 chars, case-insensitive) */
  location?: string;

  /** County (min 3 chars, case-insensitive) */
  county?: string;

  /** Zip code partial match (min 3 chars) */
  zip?: string;

  /** Trade / role / title (min 3 chars, case-insensitive) */
  trade?: string;

  /** Organization id — show open jobs for one company only (labour dashboard) */
  companyId?: number;
}
