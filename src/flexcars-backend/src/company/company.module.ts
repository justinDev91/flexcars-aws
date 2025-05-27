import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CompaniesController } from './company.controller';
import { CompaniesService } from './company.service';

@Module({
  imports: [],
  controllers: [CompaniesController],
  providers: [CompaniesService, PrismaService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
