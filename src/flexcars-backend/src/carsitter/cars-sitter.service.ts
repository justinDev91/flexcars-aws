
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, DropoffStatus } from '@prisma/client';
import { ValidateDropoffDto } from '../vehicle/dto/DropVehicle.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CarSitterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService
  ) {}

  findAll() {
    return this.prisma.carSitter.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        assignedVehicle: true
      }
    });
  }

  async findById(id: string) {
    const carSitter = await this.prisma.carSitter.findUnique({ 
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        assignedVehicle: true
      }
    });
    if (!carSitter) throw new NotFoundException('Car sitter not found');
    return carSitter;
  }

  async findAvailable(lat: number, lng: number, radius: number = 10) {
    // Pour l'instant, on retourne tous les carsitters disponibles
    // Dans une vraie implémentation, on calculerait la distance géographique
    const carSitters = await this.prisma.carSitter.findMany({
      where: {
        availability: 'AVAILABLE',
        currentLocationLat: { not: null },
        currentLocationLng: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    // Filtrer par distance (formule de distance simple)
    return carSitters.filter(carSitter => {
      if (!carSitter.currentLocationLat || !carSitter.currentLocationLng) return false;
      
      const distance = this.calculateDistance(
        lat, lng,
        carSitter.currentLocationLat, carSitter.currentLocationLng
      );
      
      return distance <= radius;
    }).map(carSitter => ({
      ...carSitter,
      distance: this.calculateDistance(
        lat, lng,
        carSitter.currentLocationLat!, carSitter.currentLocationLng!
      )
    }));
  }

  async findAllAvailable() {
    // Récupérer tous les carsitters disponibles sans géolocalisation
    return this.prisma.carSitter.findMany({
      where: {
        availability: 'AVAILABLE'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async getDropoffRequest(id: string) {
    const dropoffRequest = await this.prisma.dropoffRequest.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            customer: true,
            vehicle: true
          }
        },
        carSitter: {
          include: {
            user: true
          }
        }
      }
    });

    if (!dropoffRequest) {
      throw new NotFoundException('Dropoff request not found');
    }

    return dropoffRequest;
  }

  async validateDropoff(data: ValidateDropoffDto) {
    const dropoffRequest = await this.prisma.dropoffRequest.findUnique({
      where: { id: data.dropoffRequestId },
      include: {
        reservation: {
          include: {
            customer: true,
            vehicle: true
          }
        },
        carSitter: {
          include: {
            user: true
          }
        }
      }
    });

    if (!dropoffRequest) {
      throw new NotFoundException('Dropoff request not found');
    }

    if (dropoffRequest.status !== DropoffStatus.PENDING) {
      throw new BadRequestException('Dropoff request is not pending');
    }

    // Mettre à jour le statut de la demande
    const updatedRequest = await this.prisma.dropoffRequest.update({
      where: { id: data.dropoffRequestId },
      data: {
        status: data.isValidated ? DropoffStatus.VALIDATED : DropoffStatus.REJECTED,
        carSitterNotes: data.notes,
        validatedAt: new Date()
      }
    });

    if (data.isValidated) {
      // Mettre à jour le statut de la réservation
      await this.prisma.reservation.update({
        where: { id: dropoffRequest.reservationId },
        data: {
          status: 'COMPLETED'
        }
      });

      // Mettre à jour le véhicule
      await this.prisma.vehicle.update({
        where: { id: dropoffRequest.reservation!.vehicleId },
        data: {
          status: 'AVAILABLE',
          currentMileage: dropoffRequest.currentMileage,
          locationLat: dropoffRequest.locationLat,
          locationLng: dropoffRequest.locationLng
        }
      });

      // Envoyer un email de confirmation au client
      if (dropoffRequest.reservation?.customer?.email) {
        await this.mailerService.sendMail({
          to: dropoffRequest.reservation.customer.email,
          subject: 'Retour de véhicule confirmé',
          template: 'dropoff-confirmed',
          context: {
            customerName: dropoffRequest.reservation.customer.firstName || 'Client',
            vehicleName: `${dropoffRequest.reservation.vehicle?.brand} ${dropoffRequest.reservation.vehicle?.model}`,
            carSitterName: `${dropoffRequest.carSitter?.user?.firstName} ${dropoffRequest.carSitter?.user?.lastName}`,
            dropoffTime: dropoffRequest.dropoffTime.toLocaleDateString('fr-FR'),
            notes: data.notes || 'Aucune note'
          }
        });
      }
    }

    return {
      message: data.isValidated ? 'Dropoff validé avec succès' : 'Dropoff rejeté',
      status: updatedRequest.status,
      reservationCompleted: data.isValidated
    };
  }

  create(data: Prisma.CarSitterCreateInput) {
    return this.prisma.carSitter.create({ data });
  }

  update(id: string, data: Prisma.CarSitterUpdateInput) {
    return this.prisma.carSitter.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.carSitter.delete({ where: { id } });
  }
}
