import { BaseEntity } from 'base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('Organization')
export class Organization extends BaseEntity {
  @Column()
  companyName: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  address: string;

  @OneToOne(() => User, (user) => user.organization, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
