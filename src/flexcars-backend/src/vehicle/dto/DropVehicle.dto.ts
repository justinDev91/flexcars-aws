import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString } from 'class-validator';

// DTO pour le dropoff normal (sans carsitters)
export class DropVehicleDto {
  @ApiProperty({ description: 'ID de la réservation', example: 'reservation-uuid' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'Kilométrage actuel du véhicule', example: 15000 })
  @IsNumber()
  currentMileage: number;

  @ApiProperty({ description: 'Heure de rendu du véhicule', example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  dropoffTime: string;

  @ApiProperty({ description: 'Y a-t-il eu un accident ?', example: false })
  @IsBoolean()
  hasAccident: boolean;

  @ApiProperty({ description: 'Latitude de la position actuelle', example: 48.8566 })
  @IsNumber()
  currentLocationLat: number;

  @ApiProperty({ description: 'Longitude de la position actuelle', example: 2.3522 })
  @IsNumber()
  currentLocationLng: number;
}

// DTO pour le dropoff avec carsitters
export class DropVehicleWithCarSitterDto {
  @ApiProperty({ description: 'ID de la réservation', example: 'reservation-uuid' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'Kilométrage actuel du véhicule', example: 15000 })
  @IsNumber()
  currentMileage: number;

  @ApiProperty({ description: 'Heure de rendu du véhicule', example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  dropoffTime: string;

  @ApiProperty({ description: 'Y a-t-il eu un accident ?', example: false })
  @IsBoolean()
  hasAccident: boolean;

  @ApiProperty({ description: 'ID du carsitter choisi', example: 'carsitter-uuid' })
  @IsString()
  carSitterId: string;

  @ApiProperty({ description: 'Latitude de la position actuelle', example: 48.8566 })
  @IsNumber()
  currentLocationLat: number;

  @ApiProperty({ description: 'Longitude de la position actuelle', example: 2.3522 })
  @IsNumber()
  currentLocationLng: number;

  @ApiPropertyOptional({ description: 'Signature électronique (base64)', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' })
  @IsOptional()
  @IsString()
  signature?: string;
}

// DTO pour la validation par les carsitters
export class ValidateDropoffDto {
  @ApiProperty({ description: 'ID de la demande de dropoff', example: 'dropoff-request-uuid' })
  @IsString()
  dropoffRequestId: string;

  @ApiProperty({ description: 'Validation du dropoff par le carsitter', example: true })
  @IsBoolean()
  isValidated: boolean;

  @ApiPropertyOptional({ description: 'Notes du carsitter', example: 'Véhicule en bon état, dropoff confirmé' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO pour la réponse du calcul de pénalités
export class PenaltyCalculationDto {
  @ApiProperty({ description: 'Montant de la pénalité', example: 25.50 })
  @IsNumber()
  penaltyAmount: number;

  @ApiProperty({ description: 'ID de la facture de pénalité', example: 'invoice-uuid' })
  @IsString()
  penaltyInvoiceId: string;

  @ApiProperty({ description: 'Message explicatif', example: 'Pénalité pour dépassement de 2 heures' })
  @IsString()
  message: string;
} 