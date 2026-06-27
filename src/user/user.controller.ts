import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSwaggerSchema } from './user.swagger-schema';
import {
  governmentIdUploadOptions,
  introVideoUploadOptions,
} from './multer.config';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBody(UserSwaggerSchema.createUserBody)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const userExists = await this.userService.findByEmail(createUserDto.email);
    if (userExists) {
      throw new HttpException('User already exists', 400);
    }
    return this.userService.create(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/government-id')
  @ApiConsumes('multipart/form-data')
  @ApiBody(UserSwaggerSchema.uploadGovernmentIdBody)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'governmentIdFront', maxCount: 1 },
        { name: 'governmentIdBack', maxCount: 1 },
      ],
      governmentIdUploadOptions,
    ),
  )
  uploadGovernmentId(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      governmentIdFront?: Express.Multer.File[];
      governmentIdBack?: Express.Multer.File[];
    },
  ) {
    return this.userService.uploadGovernmentId(
      id,
      files.governmentIdFront?.[0],
      files.governmentIdBack?.[0],
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/intro-video')
  @ApiConsumes('multipart/form-data')
  @ApiBody(UserSwaggerSchema.uploadIntroVideoBody)
  @UseInterceptors(FileInterceptor('introVideo', introVideoUploadOptions))
  uploadIntroVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() introVideo: Express.Multer.File,
  ) {
    return this.userService.uploadIntroVideo(id, introVideo);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
