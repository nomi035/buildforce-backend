import { randomBytes } from 'crypto';

const PROMO_PREFIX = 'BF';
const PROMO_LENGTH = 8;

export function generatePromoCodeCandidate(): string {
  const chars = randomBytes(PROMO_LENGTH)
    .toString('base64')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, PROMO_LENGTH);

  const suffix = chars.padEnd(PROMO_LENGTH, 'X');
  return `${PROMO_PREFIX}-${suffix}`;
}

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}
