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
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyRegistrationSwaggerSchema } from './company-registration.swagger-schema';
import { CompanyRegistrationService } from './company-registration.service';
import { CompanyRegistrationDto } from './dto/company-registration.dto';
import { CompanyRegistrationPaginationDto } from './dto/company-registration-pagination.dto';
import { UpdateCompanyRegistrationDto } from './dto/update-company-registration.dto';

@Controller('user/company-registration')
@ApiTags('company-registration')
export class CompanyRegistrationController {
  constructor(
    private readonly companyRegistrationService: CompanyRegistrationService,
  ) {}

  @ApiBody(CompanyRegistrationSwaggerSchema.registerBody)
  @ApiResponse(CompanyRegistrationSwaggerSchema.companyResponse)
  @Post()
  register(@Body() dto: CompanyRegistrationDto) {
    return this.companyRegistrationService.register(dto);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse(CompanyRegistrationSwaggerSchema.companyListResponse)
  @Get()
  findAll(@Query() pagination: CompanyRegistrationPaginationDto) {
    return this.companyRegistrationService.findAll(pagination);
  }

  @ApiResponse(CompanyRegistrationSwaggerSchema.companyResponse)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyRegistrationService.findOne(id);
  }

  @ApiBody(CompanyRegistrationSwaggerSchema.updateCompanyBody)
  @ApiResponse(CompanyRegistrationSwaggerSchema.companyResponse)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyRegistrationDto,
  ) {
    return this.companyRegistrationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companyRegistrationService.remove(id);
  }
}
