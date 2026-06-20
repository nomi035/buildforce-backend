import { ExperienceRange } from 'src/labour-profile/enums/experience-range.enum';
import { LabourRole } from 'src/labour-profile/enums/labour-role.enum';
import { LabourTrade } from 'src/labour-profile/enums/labour-trade.enum';
import { SkillLevel } from 'src/labour-profile/enums/skill-level.enum';
import { JobStatus } from './enums/job-status.enum';
import { JobType } from './enums/job-type.enum';

export const JobPostingSwaggerSchema = {
  createJobBody: {
    description: 'Post a new job (company account, JWT required)',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Concrete Laborer - Downtown LA Project' },
        description: {
          type: 'string',
          example: 'Seeking experienced concrete laborers for commercial slab work.',
        },
        trade: {
          type: 'string',
          enum: Object.values(LabourTrade),
          example: 'concrete',
        },
        roles: {
          type: 'array',
          items: { type: 'string', enum: Object.values(LabourRole) },
          example: ['concrete_laborer', 'concrete_finisher'],
        },
        skillLevel: {
          type: 'string',
          enum: Object.values(SkillLevel),
          example: 'intermediate',
        },
        experience: {
          type: 'string',
          enum: Object.values(ExperienceRange),
          example: '3-5',
        },
        jobType: {
          type: 'string',
          enum: Object.values(JobType),
          example: 'full_time',
        },
        hourlyWage: { type: 'number', example: 28.5, description: 'USD per hour' },
        positionsAvailable: { type: 'number', example: 5 },
        streetAddress: { type: 'string', example: '450 S Main Street' },
        zipCode: { type: 'string', example: '90013' },
        location: { type: 'string', example: 'Los Angeles, California' },
        state: { type: 'string', example: 'California' },
        county: { type: 'string', example: 'Los Angeles' },
        startTime: { type: 'string', example: '07:00', description: '24h HH:mm' },
        endTime: { type: 'string', example: '15:30', description: '24h HH:mm' },
        startDate: { type: 'string', format: 'date', example: '2026-07-01' },
        endDate: { type: 'string', format: 'date', example: '2026-12-31' },
        status: {
          type: 'string',
          enum: Object.values(JobStatus),
          example: 'open',
        },
      },
      required: [
        'title',
        'trade',
        'roles',
        'jobType',
        'hourlyWage',
        'positionsAvailable',
        'streetAddress',
        'zipCode',
        'location',
        'startTime',
        'endTime',
        'status',
      ],
    },
  },
  updateJobBody: {
    description: 'Update job posting (company owner only). Send only fields to change. Set status to "closed" to close a job.',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        trade: { type: 'string', enum: Object.values(LabourTrade) },
        roles: {
          type: 'array',
          items: { type: 'string', enum: Object.values(LabourRole) },
        },
        skillLevel: { type: 'string', enum: Object.values(SkillLevel) },
        experience: { type: 'string', enum: Object.values(ExperienceRange) },
        jobType: { type: 'string', enum: Object.values(JobType) },
        hourlyWage: { type: 'number', example: 32 },
        positionsAvailable: { type: 'number' },
        streetAddress: { type: 'string' },
        zipCode: { type: 'string' },
        location: { type: 'string' },
        state: { type: 'string' },
        county: { type: 'string' },
        startTime: { type: 'string', example: '06:00' },
        endTime: { type: 'string', example: '14:30' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        status: {
          type: 'string',
          enum: Object.values(JobStatus),
          example: 'closed',
        },
      },
    },
  },
  jobResponse: {
    description: 'Single job posting',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        id: { type: 'number', example: 1 },
        title: { type: 'string' },
        description: { type: 'string' },
        trade: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
        skillLevel: { type: 'string' },
        experience: { type: 'string' },
        jobType: { type: 'string' },
        hourlyWage: { type: 'number', example: 28.5 },
        positionsAvailable: { type: 'number' },
        streetAddress: { type: 'string' },
        zipCode: { type: 'string' },
        location: { type: 'string' },
        state: { type: 'string' },
        county: { type: 'string' },
        startTime: { type: 'string', example: '07:00' },
        endTime: { type: 'string', example: '15:30' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        status: { type: 'string', enum: Object.values(JobStatus) },
        company: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            companyName: { type: 'string' },
            contactPerson: { type: 'string' },
            streetAddress: { type: 'string' },
            zipCode: { type: 'string' },
            location: { type: 'string' },
            county: { type: 'string' },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
  jobListResponse: {
    description: 'Paginated job list',
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
