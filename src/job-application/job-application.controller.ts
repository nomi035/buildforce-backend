import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationPaginationDto } from './dto/job-application-pagination.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationStatus } from './enums/application-status.enum';
import { JobApplicationService } from './job-application.service';
import { JobApplicationSwaggerSchema } from './job-application.swagger-schema';

@Controller('job-application')
@ApiTags('job-application')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @ApiBody(JobApplicationSwaggerSchema.applyBody)
  @ApiResponse(JobApplicationSwaggerSchema.applicationResponse)
  @Post()
  apply(
    @Req() req: { user: { userId: number; role: string } },
    @Body() dto: CreateJobApplicationDto,
  ) {
    return this.jobApplicationService.apply(req.user.userId, req.user.role, dto);
  }

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiResponse(JobApplicationSwaggerSchema.applicationListResponse)
  @Get('my')
  findMyApplications(
    @Req() req: { user: { userId: number; role: string } },
    @Query() pagination: JobApplicationPaginationDto,
  ) {
    return this.jobApplicationService.findMyApplications(
      req.user.userId,
      req.user.role,
      pagination,
    );
  }

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiResponse(JobApplicationSwaggerSchema.applicationListResponse)
  @Get('company')
  findByCompany(
    @Req() req: { user: { userId: number; role: string } },
    @Query() pagination: JobApplicationPaginationDto,
  ) {
    return this.jobApplicationService.findByCompany(
      req.user.userId,
      req.user.role,
      pagination,
    );
  }

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiResponse(JobApplicationSwaggerSchema.applicationListResponse)
  @Get('job/:jobPostingId')
  findByJob(
    @Param('jobPostingId', ParseIntPipe) jobPostingId: number,
    @Req() req: { user: { userId: number; role: string } },
    @Query() pagination: JobApplicationPaginationDto,
  ) {
    return this.jobApplicationService.findByJobPosting(
      jobPostingId,
      req.user.userId,
      req.user.role,
      pagination,
    );
  }

  @ApiResponse(JobApplicationSwaggerSchema.applicationResponse)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { userId: number; role: string } },
  ) {
    return this.jobApplicationService.findOne(id, req.user.userId, req.user.role);
  }

  @ApiBody(JobApplicationSwaggerSchema.updateStatusBody)
  @ApiResponse(JobApplicationSwaggerSchema.applicationResponse)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { userId: number; role: string } },
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.jobApplicationService.updateStatus(
      id,
      req.user.userId,
      req.user.role,
      dto,
    );
  }
}
