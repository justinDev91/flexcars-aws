import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FileUploadService } from '../utils/file-upload.service';

interface UserDataExport {
  personalData: any;
  reservations: any[];
  documents: any[];
  payments: any[];
  incidents: any[];
  notifications: any[];
  exportedAt: string;
}

@Injectable()
export class GdprService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService
  ) {}

  /**
   * Export all user data (GDPR Article 20 - Right to data portability)
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        reservations: {
          include: {
            vehicle: true,
            invoices: {
              include: {
                payments: true
              }
            }
          }
        },
        documents: true,
        notifications: true,
        Incident: {
          include: {
            vehicle: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Exclure les données sensibles
    const { password, role, ...personalData } = user;

    // Collecter tous les paiements liés aux réservations
    const payments = user.reservations.flatMap(reservation => 
      reservation.invoices.flatMap(invoice => invoice.payments)
    );

    return {
      personalData,
      reservations: user.reservations.map(({ vehicle, invoices, ...res }) => ({
        ...res,
        vehicle: vehicle ? {
          brand: vehicle.brand,
          model: vehicle.model,
          plateNumber: vehicle.plateNumber
        } : null,
        invoicesCount: invoices.length
      })),
      documents: user.documents,
      payments,
      incidents: user.Incident,
      notifications: user.notifications,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Anonymize user data (GDPR Article 17 - Right to erasure)
   */
  async anonymizeUserData(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        documents: true
      }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Supprimer physiquement les fichiers de documents
    for (const document of user.documents) {
      if (document.fileUrl) {
        const filename = document.fileUrl.split('/').pop();
        if (filename) {
          await this.fileUploadService.deleteFile(filename);
        }
      }
    }

    // Anonymiser les données dans une transaction
    await this.prisma.$transaction(async (tx) => {
      // Anonymiser les données personnelles
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `anonymized_${userId}@deleted.local`,
          firstName: 'Utilisateur',
          lastName: 'Supprimé',
          phoneNumber: null,
          birthDate: null,
          avatar: null,
          emailConfirmed: false,
          emailConfirmToken: null,
          emailConfirmExpires: null,
          passwordResetToken: null,
          passwordResetExpires: null,
          provider: null,
          providerId: null,
        }
      });

      // Supprimer les documents
      await tx.document.deleteMany({
        where: { userId }
      });

      // Anonymiser les notifications
      await tx.notification.updateMany({
        where: { userId },
        data: {
          title: 'Notification supprimée',
          message: 'Contenu anonymisé suite à la suppression des données utilisateur'
        }
      });

      // Les réservations, factures et paiements sont conservés pour les obligations comptables
      // mais anonymisés via les changements sur l'utilisateur
    });
  }

  /**
   * Get user consent information (GDPR Article 7)
   */
  async getUserConsents(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        emailConfirmed: true,
        createdAt: true,
        // Ajouter d'autres champs de consentement si nécessaire
      }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      userId: user.id,
      emailConsent: user.emailConfirmed,
      accountCreatedAt: user.createdAt,
      consents: [
        {
          type: 'email_marketing',
          given: user.emailConfirmed,
          givenAt: user.createdAt,
          description: 'Consentement pour recevoir des emails marketing'
        },
        {
          type: 'data_processing',
          given: true,
          givenAt: user.createdAt,
          description: 'Consentement pour le traitement des données personnelles'
        }
      ]
    };
  }

  /**
   * Check if user has active reservations (prevents immediate deletion)
   */
  async hasActiveReservations(userId: string): Promise<boolean> {
    const activeReservations = await this.prisma.reservation.count({
      where: {
        customerId: userId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    return activeReservations > 0;
  }
} 