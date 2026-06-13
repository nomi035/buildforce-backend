import { BaseEntity } from 'base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AvailabilityStatus } from '../enums/availability-status.enum';
import { LabourRole } from '../enums/labour-role.enum';
import { LabourTrade } from '../enums/labour-trade.enum';

@Entity('LabourProfile')
export class LabourProfile extends BaseEntity {
  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ type: 'enum', enum: LabourTrade, nullable: true })
  trade: LabourTrade;

  @Column({ type: 'enum', enum: LabourRole, nullable: true })
  role: LabourRole;

  @Column({ type: 'int', nullable: true })
  experienceYears: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  availability: AvailabilityStatus;

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @OneToOne(() => User, (user) => user.labourProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
