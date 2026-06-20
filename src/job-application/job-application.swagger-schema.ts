import { ApplicationStatus } from './enums/application-status.enum';

export const JobApplicationSwaggerSchema = {
  applyBody: {
    description: 'Labour applies to a job (JWT, role: labour)',
    schema: {
      type: 'object',
      properties: {
        jobPostingId: { type: 'number', example: 1 },
        coverNote: {
          type: 'string',
          example: 'I have 5 years experience in concrete finishing.',
        },
      },
      required: ['jobPostingId'],
    },
  },
  updateStatusBody: {
    description: 'Update application status',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ApplicationStatus),
          example: 'accepted',
        },
        companyNote: {
          type: 'string',
          example: 'Please call us to schedule an interview.',
        },
      },
      required: ['status'],
    },
  },
  applicationResponse: {
    description: 'Job application response',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        id: { type: 'number', example: 1 },
        status: { type: 'string', enum: Object.values(ApplicationStatus) },
        coverNote: { type: 'string' },
        companyNote: { type: 'string' },
        job: { type: 'object' },
        applicant: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
  applicationListResponse: {
    description: 'Paginated job applications',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPreviousPage: { type: 'boolean' },
          },
        },
      },
    },
  },
};
