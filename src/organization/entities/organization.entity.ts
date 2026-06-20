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

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  county: string;

  @Column({ nullable: true })
  workforceRequirement: string;

  @OneToOne(() => User, (user) => user.organization, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
