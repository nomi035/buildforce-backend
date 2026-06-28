import { TrainingLevel } from './enums/training-level.enum';
import { TrainingProgramType } from './enums/training-program-type.enum';

export const TrainingSwaggerSchema = {
  createProgramBody: {
    description: 'Admin — create a course or workshop for the landing page',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: Object.values(TrainingProgramType) },
        title: { type: 'string', example: 'OSHA 10-Hour Construction Safety' },
        description: { type: 'string' },
        durationHours: { type: 'number', example: 10 },
        level: { type: 'string', enum: Object.values(TrainingLevel) },
        eventDate: { type: 'string', format: 'date', example: '2024-06-15' },
        location: {
          type: 'string',
          example: 'Los Angeles, CA',
          description: 'Required for courses and workshops',
        },
        price: { type: 'number', example: 50 },
        totalSpots: { type: 'number', example: 20 },
      },
      required: ['type', 'title', 'price'],
    },
  },
  updateProgramBody: {
    description: 'Admin — update a training program',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        durationHours: { type: 'number' },
        level: { type: 'string', enum: Object.values(TrainingLevel) },
        eventDate: { type: 'string', format: 'date' },
        location: { type: 'string' },
        price: { type: 'number' },
        totalSpots: { type: 'number' },
        isActive: { type: 'boolean' },
      },
    },
  },
  programResponse: {
    status: 200,
    description: 'Single training program',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        id: { type: 'number', example: 1 },
        type: { type: 'string', enum: Object.values(TrainingProgramType) },
        title: { type: 'string' },
        durationHours: { type: 'number', example: 10 },
        level: { type: 'string', enum: Object.values(TrainingLevel) },
        eventDate: { type: 'string', example: '2024-06-15' },
        location: { type: 'string', example: 'Dallas, TX' },
        price: { type: 'number', example: 50 },
        enrolledCount: { type: 'number', example: 4820 },
        spotsLeft: { type: 'number', example: 8, nullable: true },
      },
    },
  },
  programListResponse: {
    status: 200,
    description: 'Paginated training programs',
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
  enrollBody: {
    description:
      'Enroll in a course or workshop. Logged-in users: send JWT only (no body needed). Guests: send name, email, phone.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Jane Doe' },
        email: { type: 'string', example: 'jane@example.com' },
        phone: { type: 'string', example: '+12125551234' },
      },
    },
  },
  enrollResponse: {
    status: 201,
    description: 'Enrollment successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        enrollmentId: { type: 'number', example: 1 },
        programId: { type: 'number', example: 1 },
        programTitle: { type: 'string' },
        enrolledAs: { type: 'string', enum: ['user', 'guest'] },
        message: { type: 'string', example: 'Enrolled successfully' },
      },
    },
  },
  enrollmentListResponse: {
    status: 200,
    description: 'Admin — all enrollments',
    schema: { type: 'object' },
  },
  createCertificateBody: {
    description: 'Admin — issue a certificate to a user',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 5 },
        programId: { type: 'number', example: 1 },
        title: { type: 'string', example: 'OSHA 10-Hour Safety' },
        issuedDate: { type: 'string', format: 'date', example: '2024-03-15' },
        expiryDate: { type: 'string', format: 'date', example: '2027-03-15' },
        status: { type: 'string', enum: ['valid', 'expired'] },
      },
      required: ['userId', 'title', 'issuedDate', 'expiryDate'],
    },
  },
  certificateResponse: {
    status: 200,
    description: 'Single certificate',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'OSHA 10-Hour Safety' },
        certificateNumber: { type: 'string', example: 'BF-284710' },
        issuedDate: { type: 'string', example: '2024-03-15' },
        expiryDate: { type: 'string', example: '2027-03-15' },
        status: { type: 'string', enum: ['valid', 'expired'] },
      },
    },
  },
  myCertificatesResponse: {
    status: 200,
    description: 'Logged-in user certificates (Certificates tab)',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { type: 'object' } },
        total: { type: 'number', example: 1 },
      },
    },
  },
  certificateListResponse: {
    status: 200,
    description: 'Admin — all issued certificates',
    schema: { type: 'object' },
  },
};
