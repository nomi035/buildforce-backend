export const PhoneVerificationSwaggerSchema = {
  sendCodeBody: {
    description: 'Send a verification code to a valid US phone number',
    schema: {
      type: 'object',
      properties: {
        phone: {
          type: 'string',
          example: '+12125551234',
          description: 'Valid US phone number in E.164 or national format',
        },
      },
      required: ['phone'],
    },
  },
  verifyCodeBody: {
    description: 'Verify the SMS code received from Twilio',
    schema: {
      type: 'object',
      properties: {
        phone: {
          type: 'string',
          example: '+12125551234',
        },
        code: {
          type: 'string',
          example: '123456',
        },
      },
      required: ['phone', 'code'],
    },
  },
};
