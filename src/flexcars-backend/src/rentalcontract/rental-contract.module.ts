import { Module } from '@nestjs/common';
import { RentalContractController } from './rental-contract.controller';
import { RentalContractService } from './rental-contract.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RentalContractController],
  providers: [RentalContractService, PrismaService],
  exports: [RentalContractService],
})
export class RentalContractsModule {}
