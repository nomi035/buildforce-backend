import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { ReferralPaginationDto } from './dto/referral-pagination.dto';
import { Referral } from './entities/referral.entity';
import {
  generatePromoCodeCandidate,
  normalizePromoCode,
} from './utils/promo-code.util';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
  ) {}

  private resolvePagination(pagination?: ReferralPaginationDto) {
    const page = Math.max(Number(pagination?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private mapReferralRecord(referral: Referral) {
    return {
      referralId: referral.id,
      promoCodeUsed: referral.promoCodeUsed,
      signedUpAt: referral.createdAt,
      referredUser: {
        id: referral.referredUser.id,
        name: referral.referredUser.name,
        email: referral.referredUser.email,
        role: referral.referredUser.role,
      },
    };
  }

  private async findReferrerByPromoCode(
    manager: EntityManager,
    promoCode: string,
  ) {
    const normalized = normalizePromoCode(promoCode);
    const referrer = await manager.findOne(User, {
      where: { promoCode: normalized },
    });

    if (!referrer) {
      throw new BadRequestException('Invalid promo code');
    }

    return { referrer, normalized };
  }

  async generatePromoCode(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalReferrals = await this.referralRepository.count({
      where: { referrer: { id: userId } },
    });

    if (user.promoCode) {
      return {
        success: true,
        promoCode: user.promoCode,
        totalReferrals,
        message: 'Promo code already exists',
      };
    }

    let promoCode = generatePromoCodeCandidate();
    let attempts = 0;
    while (
      await this.userRepository.findOne({ where: { promoCode } }) &&
      attempts < 10
    ) {
      promoCode = generatePromoCodeCandidate();
      attempts += 1;
    }

    if (attempts >= 10) {
      throw new ConflictException('Unable to generate a unique promo code');
    }

    user.promoCode = promoCode;
    await this.userRepository.save(user);

    return {
      success: true,
      promoCode,
      totalReferrals,
      message: 'Promo code generated successfully',
    };
  }

  async validatePromoCode(code: string) {
    const normalized = normalizePromoCode(code);
    const referrer = await this.userRepository.findOne({
      where: { promoCode: normalized },
    });

    if (!referrer) {
      throw new BadRequestException('Invalid promo code');
    }

    return {
      success: true,
      valid: true,
      promoCode: normalized,
      referrer: {
        id: referrer.id,
        name: referrer.name,
        role: referrer.role,
      },
    };
  }

  async applyReferralInTransaction(
    manager: EntityManager,
    promoCode: string | undefined,
    referredUserId: number,
  ) {
    if (!promoCode?.trim()) {
      return null;
    }

    const { referrer, normalized } = await this.findReferrerByPromoCode(
      manager,
      promoCode,
    );

    if (referrer.id === referredUserId) {
      throw new BadRequestException('You cannot use your own promo code');
    }

    const existingReferral = await manager.findOne(Referral, {
      where: { referredUser: { id: referredUserId } },
    });
    if (existingReferral) {
      throw new ConflictException('Referral has already been applied for this user');
    }

    await manager.update(User, referredUserId, { referredBy: { id: referrer.id } });

    const referral = manager.create(Referral, {
      referrer: { id: referrer.id },
      referredUser: { id: referredUserId },
      promoCodeUsed: normalized,
    });

    return manager.save(Referral, referral);
  }

  async getMyReferralSummary(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalReferrals = await this.referralRepository.count({
      where: { referrer: { id: userId } },
    });

    const recentReferrals = await this.referralRepository.find({
      where: { referrer: { id: userId } },
      relations: ['referredUser'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      success: true,
      promoCode: user.promoCode ?? null,
      totalReferrals,
      recentReferrals: recentReferrals.map((referral) =>
        this.mapReferralRecord(referral),
      ),
    };
  }

  async getMyReferrals(userId: number, pagination?: ReferralPaginationDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page, limit, skip } = this.resolvePagination(pagination);

    const [referrals, total] = await this.referralRepository.findAndCount({
      where: { referrer: { id: userId } },
      relations: ['referredUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      success: true,
      promoCode: user.promoCode ?? null,
      totalReferrals: total,
      data: referrals.map((referral) => this.mapReferralRecord(referral)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
