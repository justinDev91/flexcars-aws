import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GdprService } from './gdpr.service';
import { FileUploadService } from '../utils/file-upload.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, GdprService, FileUploadService],
  exports: [UsersService],
})
export class UsersModule {}
