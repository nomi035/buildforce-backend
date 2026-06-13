export const OrganizationSwaggerSchema = {
  createOrganizationBody: {
    description: 'Body for creating an organization profile',
    schema: {
      type: 'object',
      properties: {
        companyName: { type: 'string' },
        registrationNumber: { type: 'string' },
        industry: { type: 'string' },
        website: { type: 'string' },
        description: { type: 'string' },
        logoUrl: { type: 'string' },
        address: { type: 'string' },
        userId: { type: 'number' },
      },
      required: ['companyName', 'userId'],
    },
  },
};
