export const ReferralSwaggerSchema = {
  generatePromoCodeResponse: {
    status: 201,
    description:
      'Promo code generated or returned if the user already has one. Share this code with others during signup.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        promoCode: {
          type: 'string',
          example: 'BF-A1B2C3D4',
          description: 'Unique referral code owned by the authenticated user',
        },
        totalReferrals: {
          type: 'number',
          example: 12,
          description: 'Total number of users who signed up using this code',
        },
        message: {
          type: 'string',
          example: 'Promo code generated successfully',
        },
      },
    },
  },
  myReferralSummaryResponse: {
    status: 200,
    description:
      'Referral dashboard for the authenticated user — promo code and signup count',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        promoCode: {
          type: 'string',
          nullable: true,
          example: 'BF-A1B2C3D4',
          description:
            'Null if the user has not generated a promo code yet. Call POST /referral/promo-code first.',
        },
        totalReferrals: {
          type: 'number',
          example: 12,
          description: 'How many users signed up using this promo code',
        },
        recentReferrals: {
          type: 'array',
          description: 'Last 5 referred signups (most recent first)',
          items: {
            type: 'object',
            properties: {
              referralId: { type: 'number', example: 42 },
              promoCodeUsed: { type: 'string', example: 'BF-A1B2C3D4' },
              signedUpAt: { type: 'string', format: 'date-time' },
              referredUser: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 99 },
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', example: 'jane@example.com' },
                  role: {
                    type: 'string',
                    enum: ['labour', 'company', 'admin'],
                    example: 'labour',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  referralListResponse: {
    status: 200,
    description: 'Paginated list of all users referred by the authenticated user',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        promoCode: { type: 'string', example: 'BF-A1B2C3D4' },
        totalReferrals: { type: 'number', example: 12 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              referralId: { type: 'number', example: 42 },
              promoCodeUsed: { type: 'string', example: 'BF-A1B2C3D4' },
              signedUpAt: { type: 'string', format: 'date-time' },
              referredUser: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 12 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 2 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  },
  validatePromoCodeResponse: {
    status: 200,
    description:
      'Public check before signup — confirms the promo code exists and returns referrer display info',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        valid: { type: 'boolean', example: true },
        promoCode: { type: 'string', example: 'BF-A1B2C3D4' },
        referrer: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 5 },
            name: { type: 'string', example: 'John Smith' },
            role: { type: 'string', example: 'labour' },
          },
        },
      },
    },
  },
  invalidPromoCodeResponse: {
    status: 400,
    description: 'Promo code not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid promo code' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  },
  promoCodeSignupField: {
    type: 'string',
    example: 'BF-A1B2C3D4',
    description:
      'Optional referral promo code from another user. Validate first via GET /referral/validate/:code. ' +
      'When provided, the referrer receives credit and their referral count increases.',
  },
};
