import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get()
  getUploadedFiles() {
    return this.uploadsService.getUploadedFiles();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @Body() body: { name: string; size: number; type: string },
  ) {
    try {
      return await this.uploadsService.uploadFile(body);
    } catch {
      throw new HttpException(
        { message: 'Upload failed. Please try again.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  deleteFile(@Param('id') id: string) {
    return this.uploadsService.deleteFile(id);
  }
}
