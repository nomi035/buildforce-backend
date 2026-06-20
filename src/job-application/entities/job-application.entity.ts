import { BaseEntity } from 'base.entity';
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ApplicationStatus } from '../enums/application-status.enum';

@Entity('JobApplication')
@Unique(['jobPosting', 'applicant'])
export class JobApplication extends BaseEntity {
  @ManyToOne(() => JobPosting, { onDelete: 'CASCADE' })
  @JoinColumn()
  jobPosting: JobPosting;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  applicant: User;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverNote: string;

  @Column({ type: 'text', nullable: true })
  companyNote: string;
}
