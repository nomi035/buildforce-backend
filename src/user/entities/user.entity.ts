import { BaseEntity } from 'base.entity';
import { LabourProfile } from 'src/labour-profile/entities/labour-profile.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { Referral } from 'src/referral/entities/referral.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('User')
export class User extends BaseEntity {
  @Column()
  name: string;
  @Column()
  password: string;
  @Column()
  email: string;
  @Column()
  phone: string;
  @Column({ default: false })
  isPhoneVerified: boolean;
  @Column({ nullable: true })
  address: string;
  @Column({ nullable: true })
  role: Role;

  @Column({ nullable: true })
  governmentIdFront: string;

  @Column({ nullable: true })
  governmentIdBack: string;

  @Column({ nullable: true })
  introVideo: string;

  @Column({ unique: true, nullable: true })
  promoCode: string;

  @ManyToOne(() => User, (user) => user.referredUsers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  referredBy?: User;

  @OneToMany(() => User, (user) => user.referredBy)
  referredUsers?: User[];

  @OneToMany(() => Referral, (referral) => referral.referrer)
  referralsMade?: Referral[];

  @OneToOne(() => Referral, (referral) => referral.referredUser, {
    nullable: true,
  })
  referralReceived?: Referral;

  @OneToOne(() => Organization, (organization) => organization.user, {
    nullable: true,
  })
  organization?: Organization;

  @OneToOne(() => LabourProfile, (labourProfile) => labourProfile.user, {
    nullable: true,
  })
  labourProfile?: LabourProfile;
}

export enum Role {
  COMPANY = 'company',
  ADMIN = 'admin',
  LABOUR= 'labour',
}
