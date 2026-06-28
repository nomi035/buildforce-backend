import { BaseEntity } from 'base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { TrainingProgram } from './training-program.entity';

@Entity('TrainingEnrollment')
@Unique(['program', 'user'])
@Unique(['program', 'guestEmail'])
export class TrainingEnrollment extends BaseEntity {
  @ManyToOne(() => TrainingProgram, (program) => program.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  program: TrainingProgram;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  guestName: string;

  @Column({ nullable: true })
  guestEmail: string;

  @Column({ nullable: true })
  guestPhone: string;
}
