import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { CreateUserCertificateDto } from './dto/create-user-certificate.dto';
import { TrainingPaginationDto } from './dto/training-pagination.dto';
import { TrainingCertificateService } from './training-certificate.service';
import { TrainingSwaggerSchema } from './training.swagger-schema';

@Controller('training-certificate')
@ApiTags('training-certificate')
export class TrainingCertificateController {
  constructor(
    private readonly trainingCertificateService: TrainingCertificateService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody(TrainingSwaggerSchema.createCertificateBody)
  @ApiResponse(TrainingSwaggerSchema.certificateResponse)
  @Post()
  create(
    @Req() req: { user: { userId: number; role: string } },
    @Body() dto: CreateUserCertificateDto,
  ) {
    return this.trainingCertificateService.create(req.user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse(TrainingSwaggerSchema.myCertificatesResponse)
  @Get('my')
  findMy(@Req() req: { user: { userId: number; role: string } }) {
    return this.trainingCertificateService.findMyCertificates(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse(TrainingSwaggerSchema.certificateListResponse)
  @Get('admin/all')
  findAllAdmin(
    @Req() req: { user: { userId: number; role: string } },
    @Query() pagination: TrainingPaginationDto,
  ) {
    return this.trainingCertificateService.findAllAdmin(req.user.role, pagination);
  }

  @ApiResponse(TrainingSwaggerSchema.certificateResponse)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainingCertificateService.findOne(id);
  }
}
