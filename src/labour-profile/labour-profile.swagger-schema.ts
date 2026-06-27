import { ReferralSwaggerSchema } from 'src/referral/referral.swagger-schema';
import { ExperienceRange } from './enums/experience-range.enum';
import { LabourTrade } from './enums/labour-trade.enum';
import { Language } from './enums/language.enum';
import { SkillLevel } from './enums/skill-level.enum';

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
        promoCode: ReferralSwaggerSchema.promoCodeSignupField,
      },
      required: ['phoneVerificationToken', 'user'],
    },
  },
  createLabourOnboardingBody: {
    description:
      'Registers a labour worker in one request without phone verification',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Smith' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'secret123' },
            phone: { type: 'string', example: '+12125551234' },
          },
          required: ['name', 'email', 'password', 'phone'],
        },
        languages: {
          type: 'array',
          items: {
            type: 'string',
            enum: Object.values(Language),
          },
          example: ['English', 'Spanish'],
          description: 'One or more languages. Allowed: English, Spanish, Russian',
        },
        zipCode: { type: 'string', example: '90001' },
        state: { type: 'string', example: 'California' },
        county: { type: 'string', example: 'Los Angeles County' },
        tradeSelections: {
          type: 'array',
          description:
            'Multiple main categories, each with one or more sub-categories. Use GET /labour-profile/trades-with-roles for all options.',
          items: {
            type: 'object',
            properties: {
              trade: {
                type: 'string',
                enum: Object.values(LabourTrade),
                description: 'Main category (e.g. concrete, asphalt)',
              },
              roles: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Sub-categories under this main category (at least one required)',
              },
            },
            required: ['trade', 'roles'],
          },
          example: [
            {
              trade: 'concrete',
              roles: [
                'concrete_laborer',
                'concrete_form_setter',
                'rebar_installer',
                'concrete_grade_setter',
              ],
            },
            {
              trade: 'thermoplastic_striping',
              roles: [
                'striping_laborer',
                'striping_foreman',
                'handliner_operator',
                'layout',
              ],
            },
          ],
        },
        skillLevel: {
          type: 'string',
          enum: Object.values(SkillLevel),
          example: 'beginner',
        },
        experience: {
          type: 'string',
          enum: Object.values(ExperienceRange),
          example: '1-3',
        },
        promoCode: ReferralSwaggerSchema.promoCodeSignupField,
      },
      required: [
        'user',
        'languages',
        'zipCode',
        'state',
        'county',
        'tradeSelections',
        'skillLevel',
        'experience',
      ],
    },
  },
  createLabourOnboardingResponse: {
    description: 'Labour worker registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        id: { type: 'number', example: 1 },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'John Smith' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'secret123' },
            phone: { type: 'string', example: '+12125551234' },
            role: { type: 'string', example: 'labour' },
            isPhoneVerified: { type: 'boolean', example: false },
          },
        },
        languages: {
          type: 'array',
          items: {
            type: 'string',
            enum: Object.values(Language),
          },
          example: ['English', 'Spanish'],
        },
        zipCode: { type: 'string', example: '90001' },
        state: { type: 'string', example: 'California' },
        county: { type: 'string', example: 'Los Angeles County' },
        tradeSelections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              trade: { type: 'string', example: 'concrete' },
              roles: {
                type: 'array',
                items: { type: 'string' },
                example: ['concrete_laborer', 'concrete_form_setter'],
              },
            },
          },
        },
        skillLevel: {
          type: 'string',
          enum: Object.values(SkillLevel),
          example: 'beginner',
        },
        experience: {
          type: 'string',
          enum: Object.values(ExperienceRange),
          example: '1-3',
        },
        onboardingCompleted: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
  labourOnboardingListResponse: {
    description: 'Paginated list of labour profiles in onboarding payload format',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              id: { type: 'number', example: 1 },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'John Smith' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'secret123' },
                  phone: { type: 'string', example: '+12125551234' },
                  role: { type: 'string', example: 'labour' },
                  isPhoneVerified: { type: 'boolean', example: false },
                },
              },
              languages: {
                type: 'array',
                items: { type: 'string', enum: Object.values(Language) },
              },
              zipCode: { type: 'string', example: '90001' },
              state: { type: 'string', example: 'California' },
              county: { type: 'string', example: 'Los Angeles County' },
              tradeSelections: { type: 'array', items: { type: 'object' } },
              skillLevel: { type: 'string', enum: Object.values(SkillLevel) },
              experience: { type: 'string', enum: Object.values(ExperienceRange) },
              onboardingCompleted: { type: 'boolean', example: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 25 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 3 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  },
};
