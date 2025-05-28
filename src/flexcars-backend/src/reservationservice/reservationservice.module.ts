
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ReservationServiceController } from './rervervationservice.controller';
import { ReservationServiceService } from './reservationservice.service';

@Module({
  controllers: [ReservationServiceController],
  providers: [ReservationServiceService, PrismaService],
})
export class ReservationServiceModule {}
