
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { differenceInDays, differenceInHours, differenceInWeeks } from 'date-fns';
import { PricingType } from './dto/createPricingRule.dto';

// Constante pour la TVA française
const VAT_RATE = 0.20; // 20%

@Injectable()
export class PricingRuleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pricingRule.findMany();
  }

  async findById(id: string) {
    const pricingRule = await this.prisma.pricingRule.findUnique({ where: { id } });
    if (!pricingRule) throw new NotFoundException('Pricing rule not found');
    return pricingRule;
  }

  async calculateTotalPrice(vehicleId: string, startDate: string, endDate: string): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const pricingRule = await this.prisma.pricingRule.findFirst({
      where: { vehicleId },
    });

    // Valeurs par défaut si aucune règle n'est trouvée - prix réalistes en euros
    const defaultDurationType = 'HOURLY'; // Utiliser HOURLY comme dans le frontend
    const defaultBasePrice = 25; // 25€ HT par heure (cohérent avec le frontend)
    const defaultMultiplier = 1;

    let duration = 0;
    const durationType = pricingRule?.durationType || defaultDurationType;
    
    switch (durationType) {
      case 'HOURLY':
        duration = differenceInHours(end, start);
        break;
      case 'DAILY':
        duration = differenceInDays(end, start) || 1; // Minimum 1 jour
        break;
      case 'WEEKLY':
        duration = differenceInWeeks(end, start) || 1; // Minimum 1 semaine
        break;
      default:
        duration = differenceInHours(end, start) || 1; // Par défaut en heures comme le frontend
    }

    // Utiliser un prix de base réaliste selon le type de véhicule
    let basePrice = defaultBasePrice;
    
    if (pricingRule?.basePrice && pricingRule.basePrice > 0) {
      basePrice = pricingRule.basePrice;
    } else {
      // Si pas de règle, utiliser des prix réalistes cohérents avec le frontend
      switch (durationType) {
        case 'HOURLY':
          basePrice = 25; // 25€ HT par heure (cohérent avec le frontend)
          break;
        case 'DAILY':
          basePrice = 200; // 200€ HT par jour (25€ × 8h)
          break;
        case 'WEEKLY':
          basePrice = 1400; // 1400€ HT par semaine (25€ × 8h × 7j)
          break;
        default:
          basePrice = 25; // 25€ HT par heure par défaut
      }
    }
    
    // Multiplier réaliste (1.0 par défaut, éviter les décimales étranges)
    const multiplier = pricingRule?.dynamicMultiplier && pricingRule.dynamicMultiplier > 0
      ? Math.round(pricingRule.dynamicMultiplier * 100) / 100 // Arrondir à 2 décimales
      : defaultMultiplier;
    
    const totalPriceHT = duration * basePrice * multiplier;
    
    // Calculer le prix TTC (avec TVA de 20%)
    const totalPriceTTC = totalPriceHT * (1 + VAT_RATE);
    
    // Arrondir à 2 décimales pour un prix final propre
    const finalPriceTTC = Math.round(totalPriceTTC * 100) / 100;
    
    console.log(`💰 Calcul du prix: ${duration} ${durationType} × ${basePrice}€ HT × ${multiplier} = ${totalPriceHT}€ HT → ${finalPriceTTC}€ TTC`);
    
    return Math.max(finalPriceTTC, 6); // Minimum 6€ TTC (5€ HT + TVA)
  }

  
  async calculatePenaltyAmount(vehicleId: string, type: PricingType, from: Date, to: Date): Promise<number> {
      const pricingRule = await this.prisma.pricingRule.findFirst({
        where: {
          vehicleId,
          type,
        },
      });

      if (!pricingRule) {
        throw new NotFoundException(`No pricing rule found for type ${type}`);
      }

      let duration = 0;
      switch (pricingRule.durationType) {
        case 'HOURLY':
          duration = differenceInHours(to, from);
          break;
        case 'DAILY':
          duration = differenceInDays(to, from);
          break;
        case 'WEEKLY':
          duration = differenceInWeeks(to, from);
          break;
      }

            const base = pricingRule.basePrice ?? 1;
      const multiplier = pricingRule.dynamicMultiplier && pricingRule.dynamicMultiplier !== 0
        ? pricingRule.dynamicMultiplier
        : 1;

      const penaltyHT = duration * base * multiplier;
      // Les pénalités sont aussi soumises à la TVA
      return Math.round(penaltyHT * (1 + VAT_RATE) * 100) / 100;
  }

  create(data: Prisma.PricingRuleCreateInput) {
    return this.prisma.pricingRule.create({ data });
  }

  update(id: string, data: Prisma.PricingRuleUpdateInput) {
    return this.prisma.pricingRule.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.pricingRule.delete({ where: { id } });
  }
}
