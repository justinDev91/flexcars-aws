import { Test, TestingModule } from '@nestjs/testing';
import { PricingRuleService } from './pricing.rule.service';
import { PrismaService } from '../prisma.service';
import { PricingType } from './dto/createPricingRule.dto';

describe('PricingRuleService', () => {
  let service: PricingRuleService;
  let prismaService: PrismaService;

  const mockPricingRule = {
    id: 'pricing-rule-1',
    vehicleId: 'vehicle-1',
    type: PricingType.RENTAL,
    durationType: 'HOURLY',
    basePrice: 25,
    dynamicMultiplier: 1.2,
    season: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingRuleService,
        {
          provide: PrismaService,
          useValue: {
            pricingRule: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PricingRuleService>(PricingRuleService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateTotalPrice', () => {
    const vehicleId = 'vehicle-1';
    const startDate = '2024-01-01T10:00:00Z';
    const endDate = '2024-01-01T18:00:00Z'; // 8 heures

         it('should calculate price with existing hourly pricing rule', async () => {
       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(mockPricingRule as any);

       const result = await service.calculateTotalPrice(vehicleId, startDate, endDate);

       // D'après les logs: 8 HOURLY × 25€ HT × 1.2 = 240€ HT → 288€ TTC
       expect(result).toBe(288);
     });

         it('should use default hourly price when no pricing rule exists', async () => {
       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(null);

       const result = await service.calculateTotalPrice(vehicleId, startDate, endDate);

       // D'après les logs: 8 HOURLY × 25€ HT × 1 = 200€ HT → 240€ TTC  
       expect(result).toBe(240);
     });

     it('should calculate daily pricing correctly', async () => {
       const dailyPricingRule = {
         ...mockPricingRule,
         durationType: 'DAILY',
         basePrice: 200, // 200€ par jour
       };

       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(dailyPricingRule as any);

       const dailyStartDate = '2024-01-01T10:00:00Z';
       const dailyEndDate = '2024-01-03T10:00:00Z'; // 2 jours

       const result = await service.calculateTotalPrice(vehicleId, dailyStartDate, dailyEndDate);

       // D'après les logs: 2 DAILY × 200€ HT × 1.2 = 480€ HT → 576€ TTC
       expect(result).toBe(576);
     });

     it('should handle minimum 1 day for daily pricing', async () => {
       const dailyPricingRule = {
         ...mockPricingRule,
         durationType: 'DAILY',
         basePrice: 200,
       };

       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(dailyPricingRule as any);

       const sameDay = '2024-01-01T10:00:00Z';
       const sameDayEnd = '2024-01-01T15:00:00Z'; // Moins d'un jour

       const result = await service.calculateTotalPrice(vehicleId, sameDay, sameDayEnd);

       // D'après les logs: 1 DAILY × 200€ HT × 1.2 = 240€ HT → 288€ TTC
       expect(result).toBe(288);
     });

     it('should calculate weekly pricing correctly', async () => {
       const weeklyPricingRule = {
         ...mockPricingRule,
         durationType: 'WEEKLY',
         basePrice: 1000, // 1000€ par semaine
       };

       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(weeklyPricingRule as any);

       const weeklyStartDate = '2024-01-01T10:00:00Z';
       const weeklyEndDate = '2024-01-15T10:00:00Z'; // 2 semaines

       const result = await service.calculateTotalPrice(vehicleId, weeklyStartDate, weeklyEndDate);

       // D'après les logs: 2 WEEKLY × 1000€ HT × 1.2 = 2400€ HT → 2880€ TTC
       expect(result).toBe(2880);
     });

     it('should use default pricing for unknown duration type', async () => {
       const unknownPricingRule = {
         ...mockPricingRule,
         durationType: 'UNKNOWN' as any,
         basePrice: 50,
       };

       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(unknownPricingRule as any);

       const result = await service.calculateTotalPrice(vehicleId, startDate, endDate);

       // D'après les logs: 8 UNKNOWN × 50€ HT × 1.2 = 480€ HT → 576€ TTC
       expect(result).toBe(576);
     });

     it('should handle zero or negative base price', async () => {
       const zeroPricingRule = {
         ...mockPricingRule,
         basePrice: 0,
       };

       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(zeroPricingRule as any);

       const result = await service.calculateTotalPrice(vehicleId, startDate, endDate);

       // D'après les logs: 8 HOURLY × 25€ HT × 1.2 = 240€ HT → 288€ TTC (utilise le défaut)
       expect(result).toBe(288);
     });
  });

  describe('calculatePenaltyAmount', () => {
    const vehicleId = 'vehicle-1';
    const lateReturnType = PricingType.LATER_PENALTY;
    const endTime = new Date('2024-01-01T18:00:00Z');
    const currentTime = new Date('2024-01-01T20:00:00Z'); // 2 heures de retard

    it('should calculate late penalty correctly', async () => {
      const latePenaltyRule = {
        id: 'penalty-rule-1',
        vehicleId,
        type: PricingType.LATER_PENALTY,
        basePrice: 10, // 10€ par heure de retard
        durationType: 'HOURLY',
      };

      jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(latePenaltyRule as any);

      const result = await service.calculatePenaltyAmount(vehicleId, lateReturnType, endTime, currentTime);

      // 2 heures × 10€ × 1.2 (TTC) = 24€
      expect(result).toBe(24);
    });

         it('should throw NotFoundException when no rule exists', async () => {
       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(null);

       await expect(service.calculatePenaltyAmount(vehicleId, lateReturnType, endTime, currentTime))
         .rejects.toThrow('No pricing rule found for type LATER_PENALTY');
     });

         it('should return 0 when no delay (early or on-time return)', async () => {
       const latePenaltyRule = {
         id: 'penalty-rule-1',
         vehicleId,
         type: PricingType.LATER_PENALTY,
         basePrice: 15,
         durationType: 'HOURLY',
       };

       jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue(latePenaltyRule as any);

       const onTime = new Date('2024-01-01T18:00:00Z'); // À l'heure

       const result = await service.calculatePenaltyAmount(vehicleId, lateReturnType, endTime, onTime);

       // Pas de retard = pas de pénalité
       expect(result).toBe(0);
     });
  });
}); 