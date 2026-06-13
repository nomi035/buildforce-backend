import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard';
import { CreateLabourProfileDto } from './dto/create-labour-profile.dto';
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.labourProfileService.findAll();
  }

  @Get('trades')
  getTrades() {
    return this.labourProfileService.getTrades();
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labourProfileService.remove(+id);
  }
}
