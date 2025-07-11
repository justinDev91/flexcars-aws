import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Invoice } from '@prisma/client';
import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { generateInvoiceNumber } from 'src/utils/generateInvoiceNumber';
import * as puppeteer from 'puppeteer';

// Interface pour le type Invoice avec les relations
interface InvoiceWithRelations extends Invoice {
  reservation?: {
    id: string;
    startDatetime: Date;
    endDatetime: Date;
    vehicle: {
      brand: string;
      model: string;
      plateNumber: string;
    };
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  payments?: any[];
}

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string): Promise<Invoice[]> {
    const where = userId ? {
      reservation: {
        customerId: userId,
      },
    } : {};

    return this.prisma.invoice.findMany({
      where,
      include: {
        reservation: {
          include: {
            vehicle: true,
            customer: true,
          },
        },
        payments: true,
      },
    });
  }

  async findById(id: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findUnique({ 
      where: { id },
      include: {
        reservation: {
          include: {
            vehicle: true,
            customer: true,
          },
        },
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(data: CreateInvoiceDto): Promise<Invoice> {
    const invoice = {
      invoiceNumber: generateInvoiceNumber(),
      ...data
    }
    return this.prisma.invoice.create({ data: invoice });
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.invoice.delete({ where: { id } });
  }

  async generateInvoiceHTML(id: string): Promise<string> {
    const invoice = await this.findById(id) as InvoiceWithRelations;
    
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Les montants stockés dans la DB sont déjà TTC
    const amountTTC = invoice.amount || 0;
    const penaltyTTC = invoice.penaltyAmount || 0;
    const totalTTC = amountTTC + penaltyTTC;
    
    // Calculer le montant HT et la TVA pour l'affichage
    const amountHT = Math.round((amountTTC / 1.2) * 100) / 100;
    const vatAmount = Math.round((amountTTC - amountHT) * 100) / 100;

    // Générer le HTML de la facture
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoice.invoiceNumber}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
        }
        .company-info {
            flex: 1;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .invoice-info {
            text-align: right;
            flex: 1;
        }
        .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 10px;
        }
        .customer-info {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .details-table th,
        .details-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        .details-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }
        .summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .summary-row.total {
            font-weight: bold;
            font-size: 18px;
            color: #2c3e50;
            border-top: 2px solid #3498db;
            padding-top: 10px;
        }
        .status {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.paid {
            background-color: #d4edda;
            color: #155724;
        }
        .status.unpaid {
            background-color: #fff3cd;
            color: #856404;
        }
        .status.overdue {
            background-color: #f8d7da;
            color: #721c24;
        }
        .status.refunded {
            background-color: #cce5ff;
            color: #0056b3;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <div class="company-name">FlexCars</div>
                <div>Service de location de véhicules</div>
                <div>123 Rue de la Location</div>
                <div>75000 Paris, France</div>
            </div>
            <div class="invoice-info">
                <div class="invoice-number">Facture N° ${invoice.invoiceNumber}</div>
                <div><strong>Date d'émission:</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
                <div><strong>Date d'échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</div>
                ${invoice.paidAt ? `<div><strong>Date de paiement:</strong> ${new Date(invoice.paidAt).toLocaleDateString('fr-FR')}</div>` : ''}
                <div style="margin-top: 10px;">
                    <span class="status ${invoice.status.toLowerCase()}">
                        ${this.getStatusLabel(invoice.status)}
                    </span>
                </div>
            </div>
        </div>

        <div class="customer-info">
            <div class="section-title">Facturé à:</div>
            ${invoice.reservation?.customer ? `
                <div><strong>${invoice.reservation.customer.firstName} ${invoice.reservation.customer.lastName}</strong></div>
                <div>${invoice.reservation.customer.email}</div>
            ` : '<div>Informations client non disponibles</div>'}
        </div>

        <div class="section-title">Détails de la réservation</div>
        <table class="details-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Véhicule</th>
                    <th>Période</th>
                    <th>Montant HT</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Location de véhicule</td>
                    <td>
                        ${invoice.reservation?.vehicle ? `
                            <strong>${invoice.reservation.vehicle.brand} ${invoice.reservation.vehicle.model}</strong><br>
                            <small>Plaque: ${invoice.reservation.vehicle.plateNumber}</small>
                        ` : 'Véhicule non spécifié'}
                    </td>
                    <td>
                        ${invoice.reservation ? `
                            Du ${new Date(invoice.reservation.startDatetime).toLocaleDateString('fr-FR')}<br>
                            Au ${new Date(invoice.reservation.endDatetime).toLocaleDateString('fr-FR')}
                        ` : 'Période non spécifiée'}
                    </td>
                    <td>${amountHT.toFixed(2)} € HT</td>
                </tr>
            </tbody>
        </table>

        <div class="summary">
            <div class="summary-row">
                <span>Sous-total HT:</span>
                <span>${amountHT.toFixed(2)} €</span>
            </div>
            <div class="summary-row">
                <span>TVA (20%):</span>
                <span>${vatAmount.toFixed(2)} €</span>
            </div>
            ${(invoice.penaltyAmount || 0) > 0 ? `
                <div class="summary-row">
                    <span>Pénalités:</span>
                    <span>${(invoice.penaltyAmount || 0).toFixed(2)} €</span>
                </div>
            ` : ''}
            <div class="summary-row total">
                <span>Total TTC:</span>
                <span>${totalTTC.toFixed(2)} €</span>
            </div>
        </div>

        <div class="footer">
            <p>Merci pour votre confiance. Pour toute question, contactez-nous à support@flexcars.com</p>
            <p>FlexCars - SIRET: 123 456 789 00012 - TVA: FR12345678901</p>
        </div>
    </div>
</body>
</html>
    `;

    return html;
  }

  async generateInvoicePDF(id: string): Promise<Buffer> {
    const html = await this.generateInvoiceHTML(id);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':
        return 'Payé';
      case 'UNPAID':
        return 'Non payé';
      case 'OVERDUE':
        return 'En retard';
      case 'REFUNDED':
        return 'Remboursé';
      default:
        return status;
    }
  }
}
