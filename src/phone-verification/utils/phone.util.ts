import { BadRequestException } from '@nestjs/common';

export function normalizeUsPhone(phone: string): string {
  if (!phone?.trim()) {
    throw new BadRequestException('Phone number is required');
  }

  return phone.trim();
}
