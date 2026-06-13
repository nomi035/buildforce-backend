import { BaseEntity } from 'base.entity';
import { LabourProfile } from 'src/labour-profile/entities/labour-profile.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { Column, Entity, OneToOne } from 'typeorm';

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
