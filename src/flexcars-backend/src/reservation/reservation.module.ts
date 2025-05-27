import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ReservationController],
  providers: [ReservationService, PrismaService],
  exports: [ReservationService],
})
export class ReservationsModule {}
