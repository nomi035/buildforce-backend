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
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { EnrollTrainingProgramDto } from './dto/enroll-training-program.dto';
import { TrainingPaginationDto } from './dto/training-pagination.dto';
import { UpdateTrainingProgramDto } from './dto/update-training-program.dto';
import { TrainingProgramType } from './enums/training-program-type.enum';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { TrainingProgramService } from './training-program.service';
import { TrainingSwaggerSchema } from './training.swagger-schema';

@Controller('training-program')
@ApiTags('training-program')
export class TrainingProgramController {
  constructor(private readonly trainingProgramService: TrainingProgramService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody(TrainingSwaggerSchema.createProgramBody)
  @ApiResponse(TrainingSwaggerSchema.programResponse)
  @Post()
  create(
    @Req() req: { user: { userId: number; role: string } },
    @Body() dto: CreateTrainingProgramDto,
  ) {
    return this.trainingProgramService.create(req.user.role, dto);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TrainingProgramType,
    description: 'Filter by course or workshop (landing page tabs)',
  })
  @ApiResponse(TrainingSwaggerSchema.programListResponse)
  @Get()
  findAllPublic(
    @Query('type') type: TrainingProgramType | undefined,
    @Query() pagination: TrainingPaginationDto,
  ) {
    return this.trainingProgramService.findAllPublic(type, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse(TrainingSwaggerSchema.programListResponse)
  @Get('admin/all')
  findAllAdmin(
    @Req() req: { user: { userId: number; role: string } },
    @Query() pagination: TrainingPaginationDto,
  ) {
    return this.trainingProgramService.findAllAdmin(req.user.role, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse(TrainingSwaggerSchema.enrollmentListResponse)
  @Get('admin/enrollments')
  findEnrollmentsAdmin(
    @Req() req: { user: { userId: number; role: string } },
    @Query() pagination: TrainingPaginationDto,
  ) {
    return this.trainingProgramService.findEnrollmentsAdmin(
      req.user.role,
      pagination,
    );
  }

  @ApiResponse(TrainingSwaggerSchema.programResponse)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainingProgramService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody(TrainingSwaggerSchema.updateProgramBody)
  @ApiResponse(TrainingSwaggerSchema.programResponse)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { userId: number; role: string } },
    @Body() dto: UpdateTrainingProgramDto,
  ) {
    return this.trainingProgramService.update(id, req.user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { userId: number; role: string } },
  ) {
    return this.trainingProgramService.remove(id, req.user.role);
  }

  @ApiBody(TrainingSwaggerSchema.enrollBody)
  @ApiResponse(TrainingSwaggerSchema.enrollResponse)
  @UseGuards(OptionalJwtAuthGuard)
  @Post(':id/enroll')
  enroll(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnrollTrainingProgramDto,
    @Req() req: { user?: { userId: number; role: string } | null },
  ) {
    return this.trainingProgramService.enroll(id, dto, req.user ?? null);
  }
}
