import { LabourTrade } from './enums/labour-trade.enum';

export const LabourProfileSwaggerSchema = {
  createLabourProfileBody: {
    description:
      'Creates a verified labour user and their profile in a single transaction',
    schema: {
      type: 'object',
      properties: {
        phoneVerificationToken: {
          type: 'string',
          description:
            'Token returned from POST /phone-verification/verify-code',
        },
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
          required: ['name', 'email', 'password', 'phone'],
        },
        bio: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        trade: {
          type: 'string',
          enum: Object.values(LabourTrade),
          description: 'Work category from Book 4.xlsx',
        },
        role: {
          type: 'string',
          description:
            'Specific job role under the selected trade. Use GET /labour-profile/trades/:trade/roles for valid values.',
        },
        experienceYears: { type: 'number' },
        hourlyRate: { type: 'number' },
        availability: {
          type: 'string',
          enum: ['available', 'busy', 'unavailable'],
        },
        certifications: { type: 'array', items: { type: 'string' } },
        dateOfBirth: { type: 'string', format: 'date' },
        location: { type: 'string' },
        emergencyContact: { type: 'string' },
      },
      required: ['phoneVerificationToken', 'user'],
    },
  },
};
