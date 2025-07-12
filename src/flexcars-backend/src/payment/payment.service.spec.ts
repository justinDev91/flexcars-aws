import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma.service';
import { ReservationService } from '../reservation/reservation.service';
import { MailerService } from '@nestjs-modules/mailer';
import { StripeService } from './stripe.service';
import { PaymentStatus } from './dto/createPayment.dto';
import { InvoiceStatus } from '../invoice/dto/createInvoice.dto';
import { ReservationStatus } from '../reservation/dto/createReservation.dto';
import { VehicleStatus } from '../vehicle/dto/createVehicule.dto';
import { RefundReason } from './dto/createRefund.dto';

describe('PaymentService', () => {
  let service: PaymentService;
  let prismaService: PrismaService;
  let reservationService: ReservationService;
  let mailerService: MailerService;
  let stripeService: StripeService;

  const mockInvoice = {
    id: 'invoice-1',
    status: InvoiceStatus.UNPAID,
    reservationId: 'reservation-1',
    amount: 200,
    invoiceNumber: 'INV-001',
  };

  const mockReservation = {
    id: 'reservation-1',
    customerId: 'customer-1',
    vehicleId: 'vehicle-1',
    status: ReservationStatus.PENDING,
  };

  const mockCustomer = {
    id: 'customer-1',
    email: 'customer@example.com',
    firstName: 'John',
  };

  const mockPayment = {
    id: 'payment-1',
    invoiceId: 'invoice-1',
    transactionId: 'pi_stripe_123',
    status: PaymentStatus.SUCCESS,
    method: 'stripe',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: {
            invoice: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            payment: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            vehicle: {
              update: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            reservation: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ReservationService,
          useValue: {
            updateReservation: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: StripeService,
          useValue: {
            createRefund: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prismaService = module.get<PrismaService>(PrismaService);
    reservationService = module.get<ReservationService>(ReservationService);
    mailerService = module.get<MailerService>(MailerService);
    stripeService = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPaymentDto = {
      invoiceId: 'invoice-1',
      transactionId: 'pi_stripe_123',
      status: PaymentStatus.SUCCESS,
    };

    it('should create a successful payment and update related entities', async () => {
      jest.spyOn(prismaService.invoice, 'findUnique').mockResolvedValue(mockInvoice as any);
      jest.spyOn(reservationService, 'updateReservation').mockResolvedValue(mockReservation as any);
      jest.spyOn(prismaService.vehicle, 'update').mockResolvedValue({} as any);
      jest.spyOn(prismaService.payment, 'create').mockResolvedValue(mockPayment as any);
      jest.spyOn(prismaService.invoice, 'update').mockResolvedValue({} as any);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockCustomer as any);

      const result = await service.create(createPaymentDto as any);

      expect(result).toEqual(mockPayment);

      // Vérifier que la réservation est confirmée
      expect(reservationService.updateReservation).toHaveBeenCalledWith(
        'reservation-1',
        { status: ReservationStatus.CONFIRMED }
      );

      // Vérifier que le véhicule est marqué comme loué
      expect(prismaService.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'vehicle-1' },
        data: { status: VehicleStatus.RENTED },
      });

      // Vérifier que la facture est marquée comme payée
      expect(prismaService.invoice.update).toHaveBeenCalledWith({
        where: { id: 'invoice-1' },
        data: { status: InvoiceStatus.PAID },
      });

      // Vérifier qu'un email de confirmation est envoyé
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'customer@example.com',
        subject: 'Votre facture a été payée',
        template: 'invoice',
        context: {
          customerName: 'John',
          invoiceNumber: 'INV-001',
          amount: 200,
          paymentDate: expect.any(String),
        },
      });
    });

    it('should throw error if invoice not found', async () => {
      jest.spyOn(prismaService.invoice, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createPaymentDto as any))
        .rejects.toThrow('Invoice not found');
    });

    it('should throw error if invoice is already paid', async () => {
      const paidInvoice = { ...mockInvoice, status: InvoiceStatus.PAID };
      jest.spyOn(prismaService.invoice, 'findUnique').mockResolvedValue(paidInvoice as any);

      await expect(service.create(createPaymentDto as any))
        .rejects.toThrow('Invoice is already paid or not eligible for payment');
    });

    it('should throw error if invoice has no reservation', async () => {
      const invoiceWithoutReservation = { ...mockInvoice, reservationId: null };
      jest.spyOn(prismaService.invoice, 'findUnique').mockResolvedValue(invoiceWithoutReservation as any);

      await expect(service.create(createPaymentDto as any))
        .rejects.toThrow('Aucune réservation associée à cette facture');
    });
  });

  describe('createRefund', () => {
    const refundDto = {
      paymentId: 'payment-1',
      reservationId: 'reservation-1',
      amount: 200,
      reason: RefundReason.REQUESTED_BY_CUSTOMER,
    };

    const mockPaymentWithInvoice = {
      ...mockPayment,
      invoice: mockInvoice,
    };

    const mockStripeRefund = {
      id: 'ref_stripe_123',
      amount: 20000, // 200€ in cents
      status: 'succeeded',
    };

    it('should create a refund successfully', async () => {
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(mockPaymentWithInvoice as any);
      jest.spyOn(stripeService, 'createRefund').mockResolvedValue(mockStripeRefund as any);
      jest.spyOn(prismaService.payment, 'create').mockResolvedValue({
        id: 'refund-payment-1',
        invoiceId: 'invoice-1',
        transactionId: 'ref_stripe_123',
        status: PaymentStatus.SUCCESS,
      } as any);
      jest.spyOn(prismaService.invoice, 'update').mockResolvedValue({} as any);
      jest.spyOn(prismaService.reservation, 'update').mockResolvedValue({} as any);
      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue({
        id: 'reservation-1',
        customer: mockCustomer,
      } as any);

      const result = await service.createRefund(refundDto as any);

      expect(result).toBeDefined();

      // Vérifier que le remboursement Stripe est créé
      expect(stripeService.createRefund).toHaveBeenCalledWith(
        'pi_stripe_123',
        200,
        RefundReason.REQUESTED_BY_CUSTOMER
      );

      // Vérifier que la facture est marquée comme remboursée
      expect(prismaService.invoice.update).toHaveBeenCalledWith({
        where: { id: 'invoice-1' },
        data: { status: InvoiceStatus.REFUNDED },
      });

      // Vérifier que la réservation est annulée
      expect(prismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: { status: ReservationStatus.CANCELLED },
      });
    });

    it('should throw NotFoundException if payment not found', async () => {
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(null);

      await expect(service.createRefund(refundDto as any))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw error if payment is not successful', async () => {
      const failedPayment = { ...mockPaymentWithInvoice, status: PaymentStatus.PENDING };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(failedPayment as any);

      await expect(service.createRefund(refundDto as any))
        .rejects.toThrow('Can only refund successful payments');
    });

    it('should throw error if payment has no transaction ID', async () => {
      const paymentWithoutTransaction = { ...mockPaymentWithInvoice, transactionId: null };
      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(paymentWithoutTransaction as any);

      await expect(service.createRefund(refundDto as any))
        .rejects.toThrow('No transaction ID found for this payment');
    });

    it('should use payment amount if no amount specified', async () => {
      const refundDtoWithoutAmount = {
        paymentId: 'payment-1',
        reservationId: 'reservation-1',
        reason: RefundReason.REQUESTED_BY_CUSTOMER,
      };

      jest.spyOn(prismaService.payment, 'findUnique').mockResolvedValue(mockPaymentWithInvoice as any);
      jest.spyOn(stripeService, 'createRefund').mockResolvedValue(mockStripeRefund as any);
      jest.spyOn(prismaService.payment, 'create').mockResolvedValue({} as any);
      jest.spyOn(prismaService.invoice, 'update').mockResolvedValue({} as any);
      jest.spyOn(prismaService.reservation, 'update').mockResolvedValue({} as any);
      jest.spyOn(prismaService.reservation, 'findUnique').mockResolvedValue({
        customer: mockCustomer,
      } as any);

      await service.createRefund(refundDtoWithoutAmount as any);

      // Vérifier que le montant de la facture est utilisé
      expect(stripeService.createRefund).toHaveBeenCalledWith(
        'pi_stripe_123',
        200, // Montant de la facture
        RefundReason.REQUESTED_BY_CUSTOMER
      );
    });
  });
}); 