import { BadRequestException } from '@nestjs/common';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

export function normalizeUsPhone(phone: string): string {
  if (!phone?.trim()) {
    throw new BadRequestException('Phone number is required');
  }

  if (!isValidPhoneNumber(phone, 'US')) {
    throw new BadRequestException('Phone number must be a valid US number');
  }

  return parsePhoneNumber(phone, 'US').format('E.164');
}
