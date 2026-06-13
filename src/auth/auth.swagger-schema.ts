export const authSwaggerSchema = {
  loginBody: {
    description: 'Login with email or phone number and password',
    schema: {
      type: 'object',
      properties: {
        emailOrPhone: {
          type: 'string',
          example: 'john@example.com',
          description: 'User email or phone number',
        },
        password: {
          type: 'string',
          example: 'secret123',
        },
      },
      required: ['emailOrPhone', 'password'],
    },
  },
  loginResponse: {
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        role: { type: 'string', example: 'labour' },
        id: {
          type: 'number',
          example: 5,
          description: 'Labour profile id for labour users, otherwise user id',
        },
        userId: { type: 'number', example: 5 },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 5 },
            name: { type: 'string', example: 'John Smith' },
            email: { type: 'string', example: 'john@example.com' },
            phone: { type: 'string', example: '+12125551234' },
            role: { type: 'string', example: 'labour' },
            isPhoneVerified: { type: 'boolean', example: false },
          },
        },
      },
    },
  },
};
