import { BaseEntity } from 'base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { CertificateStatus } from '../enums/certificate-status.enum';
import { TrainingLevel } from '../enums/training-level.enum';
import { TrainingProgramType } from '../enums/training-program-type.enum';
import { TrainingEnrollment } from './training-enrollment.entity';

@Entity('TrainingProgram')
export class TrainingProgram extends BaseEntity {
  @Column({ type: 'enum', enum: TrainingProgramType })
  type: TrainingProgramType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /** Course: hours, e.g. 10 */
  @Column({ type: 'int', nullable: true })
  durationHours: number;

  @Column({ type: 'enum', enum: TrainingLevel, nullable: true })
  level: TrainingLevel;

  /** Workshop: event date */
  @Column({ type: 'date', nullable: true })
  eventDate: Date;

  /** City/state or area, e.g. "Los Angeles, CA" or "Online" */
  @Column({ nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  /** Workshop: max participants */
  @Column({ type: 'int', nullable: true })
  totalSpots: number;

  @OneToMany(() => TrainingEnrollment, (enrollment) => enrollment.program)
  enrollments: TrainingEnrollment[];
}
