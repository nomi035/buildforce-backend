import { randomInt } from 'crypto';

export function generateCertificateNumber(): string {
  const digits = randomInt(100000, 999999);
  return `BF-${digits}`;
}
