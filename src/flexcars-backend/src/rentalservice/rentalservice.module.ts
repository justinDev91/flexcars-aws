
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RentalServiceController } from './rentalservice.controller';
import { RentalServiceService } from './rentalservice.service';

@Module({
  controllers: [RentalServiceController],
  providers: [RentalServiceService, PrismaService],
})
export class RentalServiceModule {}
