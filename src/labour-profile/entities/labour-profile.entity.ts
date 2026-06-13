import { BaseEntity } from 'base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AvailabilityStatus } from '../enums/availability-status.enum';
import { LabourRole } from '../enums/labour-role.enum';
import { LabourTrade } from '../enums/labour-trade.enum';
import { SkillLevel } from '../enums/skill-level.enum';
import { TradeSelection } from '../types/trade-selection.type';

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

  @Column({ type: 'simple-array', nullable: true })
  roles: LabourRole[];

  @Column({ type: 'jsonb', nullable: true })
  tradeSelections: TradeSelection[];

  @Column({ type: 'int', nullable: true })
  experienceYears: number;

  @Column({ nullable: true })
  experience: string;

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
  language: string;

  @Column({ type: 'simple-array', nullable: true })
  languages: string[];

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  county: string;

  @Column({ type: 'enum', enum: SkillLevel, nullable: true })
  skillLevel: SkillLevel;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ nullable: true })
  emergencyContact: string;

  @OneToOne(() => User, (user) => user.labourProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
