import { ExperienceRange } from 'src/labour-profile/enums/experience-range.enum';
import { LabourRole } from 'src/labour-profile/enums/labour-role.enum';
import { LabourTrade } from 'src/labour-profile/enums/labour-trade.enum';
import { SkillLevel } from 'src/labour-profile/enums/skill-level.enum';
import { JobStatus } from '../enums/job-status.enum';
import { JobType } from '../enums/job-type.enum';

/** Matches the company "Post a job" form fields */
export class CreateJobPostingDto {
  /** Job title */
  title: string;

  /** Description */
  description?: string;

  /** Trade category */
  trade: LabourTrade;

  /** Trades / roles */
  roles: LabourRole[];

  /** Skill level */
  skillLevel?: SkillLevel;

  /** Experience */
  experience?: ExperienceRange;

  /** Job type */
  jobType: JobType;

  /** Hourly wage (USD) */
  hourlyWage: number;

  /** Positions available */
  positionsAvailable?: number;

  /** Street address */
  streetAddress: string;

  /** Zip code */
  zipCode: string;

  /** Location (city, state) */
  location: string;

  /** State */
  state?: string;

  /** County */
  county?: string;

  /** Start time — 24h HH:mm */
  startTime: string;

  /** End time — 24h HH:mm */
  endTime: string;

  /** Start date — YYYY-MM-DD */
  startDate?: string;

  /** End date — YYYY-MM-DD */
  endDate?: string;

  /** Status */
  status?: JobStatus;
}
