import {
  Body,
  Controller,
  Delete,
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
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { JobPostingPaginationDto } from './dto/job-posting-pagination.dto';
import { JobPostingSearchDto } from './dto/job-posting-search.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { JobStatus } from './enums/job-status.enum';
import { JobPostingService } from './job-posting.service';
import { JobPostingSwaggerSchema } from './job-posting.swagger-schema';

@Controller('job-posting')
@ApiTags('job-posting')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody(JobPostingSwaggerSchema.createJobBody)
  @ApiResponse(JobPostingSwaggerSchema.jobResponse)
  @Post()
  create(@Req() req: { user: { userId: number; role: string } }, @Body() dto: CreateJobPostingDto) {
    return this.jobPostingService.create(req.user.userId, req.user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: JobStatus,
    description: 'Filter by status (company dashboard)',
  })
  @ApiResponse(JobPostingSwaggerSchema.jobListResponse)
  @Get('company')
  findByCompany(
    @Req() req: { user: { userId: number; role: string } },
    @Query() pagination: JobPostingPaginationDto,
  ) {
    return this.jobPostingService.findAllByCompany(
      req.user.userId,
      req.user.role,
      pagination,
    );
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'query',
    required: false,
    type: String,
    description: 'Search title, company, trade, location (min 3 chars, case-insensitive)',
    example: 'concrete',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'City or area (min 3 chars)',
    example: 'los angeles',
  })
  @ApiQuery({
    name: 'county',
    required: false,
    type: String,
    description: 'County (min 3 chars)',
    example: 'los angeles',
  })
  @ApiQuery({
    name: 'zip',
    required: false,
    type: String,
    description: 'Zip code partial match (min 3 chars)',
    example: '900',
  })
  @ApiQuery({
    name: 'trade',
    required: false,
    type: String,
    description: 'Trade, role, or job title (min 3 chars)',
    example: 'welder',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
    description: 'Organization id — open jobs for one company only',
    example: 3,
  })
  @ApiResponse(JobPostingSwaggerSchema.jobListResponse)
  @Get()
  findAllPublic(@Query() search: JobPostingSearchDto) {
    return this.jobPostingService.findAllPublic(search);
  }

  @ApiResponse(JobPostingSwaggerSchema.jobResponse)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobPostingService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody(JobPostingSwaggerSchema.updateJobBody)
  @ApiResponse(JobPostingSwaggerSchema.jobResponse)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { userId: number; role: string } },
    @Body() dto: UpdateJobPostingDto,
  ) {
    return this.jobPostingService.update(id, req.user.userId, req.user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { userId: number; role: string } },
  ) {
    return this.jobPostingService.remove(id, req.user.userId, req.user.role);
  }
}
