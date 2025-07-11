
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { PrismaService } from 'src/prisma.service';
import { CarSitterController } from './cars-sitter.controller';
import { CarSitterService } from './cars-sitter.service';

@Module({
  imports: [MailerModule],
  controllers: [CarSitterController],
  providers: [CarSitterService, PrismaService],
  exports: [CarSitterService],
})
export class CarSitterModule {}
