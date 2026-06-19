import { BaseEntity } from 'base.entity';
import { ExperienceRange } from 'src/labour-profile/enums/experience-range.enum';
import { LabourRole } from 'src/labour-profile/enums/labour-role.enum';
import { LabourTrade } from 'src/labour-profile/enums/labour-trade.enum';
import { SkillLevel } from 'src/labour-profile/enums/skill-level.enum';
import { Organization } from 'src/organization/entities/organization.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { JobStatus } from '../enums/job-status.enum';
import { JobType } from '../enums/job-type.enum';

@Entity('JobPosting')
export class JobPosting extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: LabourTrade })
  trade: LabourTrade;

  @Column({ type: 'simple-array' })
  roles: LabourRole[];

  @Column({ type: 'enum', enum: SkillLevel, nullable: true })
  skillLevel: SkillLevel;

  @Column({ type: 'enum', enum: ExperienceRange, nullable: true })
  experience: ExperienceRange;

  @Column({ type: 'enum', enum: JobType })
  jobType: JobType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyWage: number;

  @Column({ type: 'int', default: 1 })
  positionsAvailable: number;

  @Column()
  streetAddress: string;

  @Column()
  zipCode: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  county: string;

  /** Daily shift start in 24h format, e.g. "07:00" */
  @Column()
  startTime: string;

  /** Daily shift end in 24h format, e.g. "15:30" */
  @Column()
  endTime: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.OPEN })
  status: JobStatus;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn()
  organization: Organization;
}
