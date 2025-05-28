
import { Module } from '@nestjs/common';
import { IncidentController } from './incident.controller';
import { IncidentService } from './incident.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [IncidentController],
  providers: [IncidentService, PrismaService],
})
export class IncidentModule {}
