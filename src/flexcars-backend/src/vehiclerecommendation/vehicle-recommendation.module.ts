
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { VehicleRecommendationController } from './vehicle-recommendation.controller';
import { VehicleRecommendationService } from './vehicle-recommendation.dto';

@Module({
  controllers: [VehicleRecommendationController],
  providers: [VehicleRecommendationService, PrismaService],
})
export class VehicleRecommendationModule {}
