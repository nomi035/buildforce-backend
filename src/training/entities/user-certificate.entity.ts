import { BaseEntity } from 'base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CertificateStatus } from '../enums/certificate-status.enum';
import { TrainingProgram } from './training-program.entity';

@Entity('UserCertificate')
export class UserCertificate extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => TrainingProgram, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  program: TrainingProgram;

  @Column()
  title: string;

  @Column({ unique: true })
  certificateNumber: string;

  @Column({ type: 'date' })
  issuedDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'enum', enum: CertificateStatus, default: CertificateStatus.VALID })
  status: CertificateStatus;
}
