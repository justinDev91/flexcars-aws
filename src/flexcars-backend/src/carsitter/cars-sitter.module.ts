
import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { CarSitterController } from './cars-sitter.controller';
import { CarSitterService } from './cars-sitter.service';

@Module({
  controllers: [CarSitterController],
  providers: [CarSitterService, PrismaService],
})
export class CarSitterModule {}
