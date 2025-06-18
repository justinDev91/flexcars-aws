import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, MaintenanceAlert } from '@prisma/client';
import { FindAllMaintenanceAlertDto } from './dto/FindAllMaintenanceAlert.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MaintenanceAlertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async findAll(params: FindAllMaintenanceAlertDto): Promise<MaintenanceAlert[]> {
    const { page, limit } = params;
    return this.prisma.maintenanceAlert.findMany({
      skip: limit * (page - 1),
      take: limit,
      orderBy: { alertDate: 'desc' },
    });
  }

  async findById(id: string): Promise<MaintenanceAlert> {
    const alert = await this.prisma.maintenanceAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Maintenance alert not found');
    return alert;
  }

  async createMaintenanceAlert(data: Prisma.MaintenanceAlertCreateInput): Promise<MaintenanceAlert> {
    const alert = await this.prisma.maintenanceAlert.create({ data });

    await this.mailerService.sendMail({
      to: 'justinkatasi.dev@gmail.com', 
      subject: 'Nouvelle alerte de maintenance',
      template: 'maintenance-alert',
      context: {
        recipientName: 'Justin Katasi',
        action: 'créée',
        vehicleId: alert.vehicleId,
        alertType: alert.alertType,
        message: alert.message,
        alertDate: alert.alertDate.toLocaleDateString('fr-FR'),
        resolved: alert.resolved ? 'Oui' : 'Non',
        url: `http://localhost:3000/maintenances/${alert.id}`,
      },
    });

    return alert;
  }

  async updateMaintenanceAlert(id: string, data: Prisma.MaintenanceAlertUpdateInput): Promise<MaintenanceAlert> {
    const alert = await this.prisma.maintenanceAlert.update({ where: { id }, data });

    await this.mailerService.sendMail({
      to: 'justinkatasi.dev@gmail.com',
      subject: 'Mise à jour de l’alerte de maintenance',
      template: 'maintenance-alert',
      context: {
        recipientName: 'Justin Katasi',
        action: 'mise à jour',
        vehicleId: alert.vehicleId,
        alertType: alert.alertType,
        message: alert.message,
        alertDate: alert.alertDate.toLocaleDateString('fr-FR'),
        resolved: alert.resolved ? 'Oui' : 'Non',
        url: `http://localhost:3000/maintenances/${alert.id}`,
      },
    });

    return alert;
  }


  async deleteMaintenanceAlert(id: string): Promise<MaintenanceAlert> {
    return this.prisma.maintenanceAlert.delete({ where: { id } });
  }
}
