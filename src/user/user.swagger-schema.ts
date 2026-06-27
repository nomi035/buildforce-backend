export const UserSwaggerSchema = {
  createUserBody: {
    description: 'Body for creating user',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        role: { type: 'string' },
      },
    },
  },
  uploadGovernmentIdBody: {
    description: 'Upload government ID front and/or back images (max 5MB each)',
    schema: {
      type: 'object',
      properties: {
        governmentIdFront: {
          type: 'string',
          format: 'binary',
          description: 'Front of government ID (JPEG, PNG, WebP)',
        },
        governmentIdBack: {
          type: 'string',
          format: 'binary',
          description: 'Back of government ID (JPEG, PNG, WebP)',
        },
      },
    },
  },
  uploadIntroVideoBody: {
    description: 'Upload intro video (max 100MB)',
    schema: {
      type: 'object',
      properties: {
        introVideo: {
          type: 'string',
          format: 'binary',
          description: 'Intro video (MP4, MOV, WebM, MPEG)',
        },
      },
      required: ['introVideo'],
    },
  },
};
