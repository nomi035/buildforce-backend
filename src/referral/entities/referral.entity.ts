import { BaseEntity } from 'base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('Referral')
export class Referral extends BaseEntity {
  @Column()
  promoCodeUsed: string;

  @ManyToOne(() => User, (user) => user.referralsMade, { onDelete: 'CASCADE' })
  @JoinColumn()
  referrer: User;

  @OneToOne(() => User, (user) => user.referralReceived, { onDelete: 'CASCADE' })
  @JoinColumn()
  referredUser: User;
}
