import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard';
import { CreateLabourOnboardingDto } from './dto/create-labour-onboarding.dto';
import { CreateLabourProfileDto } from './dto/create-labour-profile.dto';
import { LabourProfilePaginationDto } from './dto/labour-profile-pagination.dto';
import { UpdateLabourProfileDto } from './dto/update-labour-profile.dto';
import { LabourProfileService } from './labour-profile.service';
import { LabourProfileSwaggerSchema } from './labour-profile.swagger-schema';
import { LabourTrade } from './enums';

@Controller('labour-profile')
@ApiTags('labour-profile')
export class LabourProfileController {
  constructor(private readonly labourProfileService: LabourProfileService) {}

  @ApiBody(LabourProfileSwaggerSchema.createLabourProfileBody)
  @Post()
  create(@Body() createLabourProfileDto: CreateLabourProfileDto) {
    return this.labourProfileService.create(createLabourProfileDto);
  }

  @ApiBody(LabourProfileSwaggerSchema.createLabourOnboardingBody)
  @ApiResponse(LabourProfileSwaggerSchema.createLabourOnboardingResponse)
  @Post('new')
  createNew(@Body() createLabourOnboardingDto: CreateLabourOnboardingDto) {
    return this.labourProfileService.createNew(createLabourOnboardingDto);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse(LabourProfileSwaggerSchema.labourOnboardingListResponse)
  @Get()
  findAll(@Query() pagination: LabourProfilePaginationDto) {
    return this.labourProfileService.findAll(pagination);
  }

  @Get('trades')
  getTrades() {
    return this.labourProfileService.getTrades();
  }

  @Get('trades-with-roles')
  getTradesWithRoles() {
    return this.labourProfileService.getTradesWithRoles();
  }

  @Get('trades/:trade/roles')
  getRolesByTrade(@Param('trade') trade: LabourTrade) {
    return this.labourProfileService.getRolesByTrade(trade);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('available')
  findAvailable() {
    return this.labourProfileService.findAvailable();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.labourProfileService.findByUserId(+userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labourProfileService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLabourProfileDto: UpdateLabourProfileDto,
  ) {
    return this.labourProfileService.update(+id, updateLabourProfileDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labourProfileService.remove(+id);
  }
}
