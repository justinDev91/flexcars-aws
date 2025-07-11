import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicle.service';
import { PrismaService } from '../prisma.service';
import { PricingRuleService } from '../pricingrule/pricing.rule.service';
import { MailerService } from '@nestjs-modules/mailer';
import { VehicleStatus } from './dto/createVehicule.dto';
import { ReservationStatus } from '../reservation/dto/createReservation.dto';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let prismaService: PrismaService;
  let pricingRuleService: PricingRuleService;
  let mailerService: MailerService;

  // Mock data simplifié - endDatetime dans le futur pour éviter les pénalités de retard
  const mockReservation = {
    id: 'reservation-1',
    vehicleId: 'vehicle-1',
    customerId: 'customer-1',
    status: ReservationStatus.CONFIRMED,
    startDatetime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures dans le passé
    endDatetime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 heures dans le futur
    carSittingOption: false,
    customer: {
      email: 'customer@example.com',
      firstName: 'John',
    },
    vehicle: {
      brand: 'BMW',
      model: 'X3',
    },
    invoices: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: PrismaService,
          useValue: {
            reservation: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            vehicle: {
              update: jest.fn(),
            },
            pricingRule: {
              findFirst: jest.fn(),
            },
            invoice: {
              create: jest.fn(),
            },
            dropoffRequest: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: PricingRuleService,
          useValue: {
            calculatePenaltyAmount: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    prismaService = module.get<PrismaService>(PrismaService);
    pricingRuleService = module.get<PricingRuleService>(PricingRuleService);
    mailerService = module.get<MailerService>(MailerService);
  });

  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDropoffPenalty', () => {
    it('should return no penalty for on-time return without accident', async () => {
      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(mockReservation as any);

      const result = await service.calculateDropoffPenalty('reservation-1', false);

      expect(result.penaltyAmount).toBe(0);
      expect(result.message).toBe('Aucune pénalité à payer');
    });

    it('should calculate penalty for accident', async () => {
      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(mockReservation as any);
      jest.spyOn(prismaService.pricingRule, 'findFirst').mockResolvedValue({ basePrice: 100 } as any);
      jest.spyOn(prismaService.invoice, 'create').mockResolvedValue({
        id: 'penalty-invoice-1',
        penaltyAmount: 120,
      } as any);

      const result = await service.calculateDropoffPenalty('reservation-1', true);

      expect(result.penaltyAmount).toBe(120);
      expect(result.message).toContain('Pénalité pour accident');
    });

    it('should calculate penalty for late return', async () => {
      const lateReservation = {
        ...mockReservation,
        endDatetime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures en retard
      };

      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(lateReservation as any);
      jest.spyOn(pricingRuleService, 'calculatePenaltyAmount').mockResolvedValue(50);
      jest.spyOn(prismaService.invoice, 'create').mockResolvedValue({
        id: 'penalty-invoice-1',
        penaltyAmount: 50,
      } as any);

      const result = await service.calculateDropoffPenalty('reservation-1', false);

      expect(result.penaltyAmount).toBe(50);
      expect(result.message).toContain('heure(s) de retard');
    });

    it('should throw NotFoundException for non-existent reservation', async () => {
      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(null);

      await expect(service.calculateDropoffPenalty('invalid-id', false))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('dropoffNormal', () => {
    const dropoffData = {
      reservationId: 'reservation-1',
      currentMileage: 15100,
      hasAccident: false,
      currentLocationLat: 48.8566,
      currentLocationLng: 2.3522,
      dropoffTime: new Date().toISOString(),
    };

    it('should complete normal dropoff without penalties', async () => {
      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(mockReservation as any);
      jest.spyOn(service, 'calculateDropoffPenalty').mockResolvedValue({
        penaltyAmount: 0,
        penaltyInvoiceId: null,
        message: 'Aucune pénalité à payer',
      });
      jest.spyOn(prismaService.vehicle, 'update').mockResolvedValue({} as any);
      jest.spyOn(prismaService.reservation, 'update').mockResolvedValue({} as any);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({} as any);

      const result = await service.dropoffNormal(dropoffData as any);

      expect(result.needsPayment).toBe(false);
      expect(result.message).toBe('Véhicule rendu avec succès');
      expect(result.penaltyAmount).toBe(0);

      expect(prismaService.vehicle.update).toHaveBeenCalledWith({
        where: { id: mockReservation.vehicleId },
        data: {
          status: VehicleStatus.AVAILABLE,
          currentMileage: dropoffData.currentMileage,
          locationLat: dropoffData.currentLocationLat,
          locationLng: dropoffData.currentLocationLng,
        },
      });

      expect(prismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: mockReservation.id },
        data: {
          status: ReservationStatus.COMPLETED,
        },
      });
    });

    it('should require payment when penalties exist', async () => {
      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(mockReservation as any);
      jest.spyOn(service, 'calculateDropoffPenalty').mockResolvedValue({
        penaltyAmount: 120,
        penaltyInvoiceId: 'penalty-invoice-1',
        message: 'Pénalité pour accident',
      });

      const result = await service.dropoffNormal(dropoffData as any);

      expect(result.needsPayment).toBe(true);
      expect(result.penaltyAmount).toBe(120);
      expect(result.penaltyInvoiceId).toBe('penalty-invoice-1');
      expect(result.message).toContain('Vous devez payer 120€ TTC avant de terminer le dropoff');
    });

    it('should throw BadRequestException for non-confirmed reservation', async () => {
      const nonConfirmedReservation = {
        ...mockReservation,
        status: ReservationStatus.PENDING,
      };

      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(nonConfirmedReservation as any);

      await expect(service.dropoffNormal(dropoffData as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent reservation', async () => {
      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(null);

      await expect(service.dropoffNormal(dropoffData as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('dropoffWithCarSitter', () => {
    const carSitterDropoffData = {
      reservationId: 'reservation-1',
      carSitterId: 'carsitter-1',
      currentMileage: 15100,
      hasAccident: false,
      dropoffTime: new Date().toISOString(),
      currentLocationLat: 48.8566,
      currentLocationLng: 2.3522,
      signature: 'base64-signature',
    };

    it('should create dropoff request without penalties', async () => {
      const reservationWithCarSitting = {
        ...mockReservation,
        carSittingOption: true,
      };

      const mockDropoffRequest = {
        id: 'dropoff-request-1',
        carSitter: {
          user: {
            email: 'carsitter@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
          },
        },
      };

      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(reservationWithCarSitting as any);
      jest.spyOn(service, 'calculateDropoffPenalty').mockResolvedValue({
        penaltyAmount: 0,
        penaltyInvoiceId: null,
        message: 'Aucune pénalité à payer',
      });
      jest.spyOn(prismaService.dropoffRequest, 'create').mockResolvedValue(mockDropoffRequest as any);

      const result = await service.dropoffWithCarSitter(carSitterDropoffData as any);

      expect(result.message).toBe('Demande de dropoff créée avec succès. Le carsitter va recevoir un email pour validation.');
      expect(result.dropoffRequestId).toBe('dropoff-request-1');
      expect(mailerService.sendMail).toHaveBeenCalled();
    });

    it('should throw BadRequestException when car sitting option not selected', async () => {
      const reservationWithoutCarSitting = {
        ...mockReservation,
        carSittingOption: false,
      };

      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue(reservationWithoutCarSitting as any);

      await expect(service.dropoffWithCarSitter(carSitterDropoffData as any))
        .rejects.toThrow(BadRequestException);
    });
  });
}); 