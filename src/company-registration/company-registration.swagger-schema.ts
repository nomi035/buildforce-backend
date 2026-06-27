import { ReferralSwaggerSchema } from 'src/referral/referral.swagger-schema';
import { WorkforceRequirement } from './enums/workforce-requirement.enum';

export const CompanyRegistrationSwaggerSchema = {
  registerBody: {
    description: 'Register a construction company in one request',
    schema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', example: 'Vasquez Whitley Traders' },
        businessLicenseNumber: { type: 'string', example: '315' },
        contactPerson: { type: 'string', example: 'John Smith' },
        email: { type: 'string', example: 'company@example.com' },
        password: { type: 'string', example: 'secret123' },
        phone: { type: 'string', example: '(506) 351-8431' },
        streetAddress: { type: 'string', example: '123 Main Street' },
        zipCode: { type: 'string', example: '90001' },
        location: { type: 'string', example: 'Los Angeles, California' },
        county: { type: 'string', example: 'Los Angeles' },
        workforceRequirement: {
          type: 'string',
          enum: Object.values(WorkforceRequirement),
          example: '1-10',
        },
        promoCode: ReferralSwaggerSchema.promoCodeSignupField,
      },
      required: [
        'companyName',
        'businessLicenseNumber',
        'contactPerson',
        'email',
        'password',
        'phone',
        'streetAddress',
        'zipCode',
        'location',
        'county',
        'workforceRequirement',
      ],
    },
  },
  updateCompanyBody: {
    description: 'Update company registration (admin). Send only fields to change.',
    schema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', example: 'Updated Corp Name' },
        businessLicenseNumber: { type: 'string', example: '315' },
        contactPerson: { type: 'string', example: 'Jane Doe' },
        email: { type: 'string', example: 'newemail@example.com' },
        password: { type: 'string', example: 'newsecret123' },
        phone: { type: 'string', example: '(506) 351-8431' },
        streetAddress: { type: 'string', example: '456 Oak Avenue' },
        zipCode: { type: 'string', example: '90002' },
        location: { type: 'string', example: 'San Diego, California' },
        county: { type: 'string', example: 'San Diego' },
        workforceRequirement: {
          type: 'string',
          enum: Object.values(WorkforceRequirement),
          example: '10-50',
        },
      },
    },
  },
  companyResponse: {
    description: 'Company registration response',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        id: { type: 'number', example: 1 },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', example: 'company' },
          },
        },
        companyName: { type: 'string' },
        businessLicenseNumber: { type: 'string' },
        contactPerson: { type: 'string' },
        streetAddress: { type: 'string' },
        zipCode: { type: 'string' },
        location: { type: 'string' },
        county: { type: 'string' },
        workforceRequirement: {
          type: 'string',
          enum: Object.values(WorkforceRequirement),
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
  companyListResponse: {
    description: 'Paginated list of registered companies',
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
              user: { type: 'object' },
              companyName: { type: 'string' },
              businessLicenseNumber: { type: 'string' },
              contactPerson: { type: 'string' },
              streetAddress: { type: 'string' },
              zipCode: { type: 'string' },
              location: { type: 'string' },
              county: { type: 'string' },
              workforceRequirement: {
                type: 'string',
                enum: Object.values(WorkforceRequirement),
              },
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
