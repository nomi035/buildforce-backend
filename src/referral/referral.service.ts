import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { ReferralAdminDashboardDto } from './dto/referral-admin-dashboard.dto';
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

  private assertAdmin(role?: string) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admin accounts can access referral admin data');
    }
  }

  private resolvePagination(pagination?: ReferralPaginationDto) {
    const page = Math.max(Number(pagination?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private buildPaginationMeta(
    total: number,
    page: number,
    limit: number,
  ) {
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    };
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

  async getAdminDashboard(
    adminRole: string,
    query?: ReferralAdminDashboardDto,
  ) {
    this.assertAdmin(adminRole);

    const { page, limit, skip } = this.resolvePagination(query);
    const roleFilter = query?.role ?? Role.LABOUR;

    const totalReferrals = await this.referralRepository.count();

    const summaryQb = this.referralRepository
      .createQueryBuilder('referral')
      .innerJoin('referral.referrer', 'referrer')
      .select('COUNT(DISTINCT referrer.id)', 'totalReferrers')
      .addSelect(
        `COUNT(DISTINCT referrer.id) FILTER (WHERE referrer.role = :labourRole)`,
        'labourReferrers',
      )
      .setParameter('labourRole', Role.LABOUR);

    const summaryRaw = await summaryQb.getRawOne<{
      totalReferrers: string;
      labourReferrers: string;
    }>();

    const rankedQb = this.referralRepository
      .createQueryBuilder('referral')
      .innerJoin('referral.referrer', 'referrer')
      .select('referrer.id', 'userId')
      .addSelect('referrer.name', 'name')
      .addSelect('referrer.email', 'email')
      .addSelect('referrer.phone', 'phone')
      .addSelect('referrer.role', 'role')
      .addSelect('referrer.promoCode', 'promoCode')
      .addSelect('COUNT(referral.id)', 'totalReferrals')
      .addSelect('MAX(referral.createdAt)', 'lastReferralAt')
      .groupBy('referrer.id')
      .addGroupBy('referrer.name')
      .addGroupBy('referrer.email')
      .addGroupBy('referrer.phone')
      .addGroupBy('referrer.role')
      .addGroupBy('referrer.promoCode')
      .orderBy('COUNT(referral.id)', 'DESC')
      .addOrderBy('MAX(referral.createdAt)', 'DESC');

    if (roleFilter) {
      rankedQb.andWhere('referrer.role = :roleFilter', { roleFilter });
    }

    const allRanked = await rankedQb.getRawMany<{
      userId: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      promoCode: string | null;
      totalReferrals: string;
      lastReferralAt: string;
    }>();

    const total = allRanked.length;
    const pageRows = allRanked.slice(skip, skip + limit);

    return {
      success: true,
      summary: {
        totalReferrals,
        totalReferrers: Number(summaryRaw?.totalReferrers ?? 0),
        labourReferrers: Number(summaryRaw?.labourReferrers ?? 0),
      },
      data: pageRows.map((row, index) => ({
        rank: skip + index + 1,
        userId: Number(row.userId),
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        promoCode: row.promoCode,
        totalReferrals: Number(row.totalReferrals),
        lastReferralAt: row.lastReferralAt,
      })),
      meta: this.buildPaginationMeta(total, page, limit),
    };
  }

  async getAdminReferrerDetail(
    adminRole: string,
    referrerUserId: number,
    pagination?: ReferralPaginationDto,
  ) {
    this.assertAdmin(adminRole);

    const referrer = await this.userRepository.findOne({
      where: { id: referrerUserId },
    });
    if (!referrer) {
      throw new NotFoundException('Referrer not found');
    }

    const { page, limit, skip } = this.resolvePagination(pagination);

    const [referrals, total] = await this.referralRepository.findAndCount({
      where: { referrer: { id: referrerUserId } },
      relations: ['referredUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      success: true,
      referrer: {
        userId: referrer.id,
        name: referrer.name,
        email: referrer.email,
        phone: referrer.phone,
        role: referrer.role,
        promoCode: referrer.promoCode ?? null,
        totalReferrals: total,
      },
      data: referrals.map((referral) => this.mapReferralRecord(referral)),
      meta: this.buildPaginationMeta(total, page, limit),
    };
  }
}
