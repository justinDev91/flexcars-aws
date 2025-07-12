import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export enum Location {
  PARIS_11 = 'PARIS_11',
  PARIS_19 = 'PARIS_19',
  ISSY_LES_MOULINEAUX = 'ISSY_LES_MOULINEAUX',
  BOULOGNE = 'BOULOGNE',
  SAINT_DENIS = 'SAINT_DENIS',
}

// DTO pour le pickup normal
export class PickupVehicleDto {
  @ApiProperty({ description: 'ID de la réservation', example: 'reservation-uuid' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'Heure de pickup demandée', example: '2024-07-12T14:00:00.000Z' })
  @IsDateString()
  requestedTime: string;

  @ApiProperty({ description: 'Lieu de pickup', enum: Location, example: Location.SAINT_DENIS })
  @IsEnum(Location)
  pickupLocation: Location;
}

// DTO pour le pickup avec carsitter
export class PickupVehicleWithCarSitterDto {
  @ApiProperty({ description: 'ID de la réservation', example: 'reservation-uuid' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'ID du carsitter', example: 'carsitter-uuid' })
  @IsString()
  carSitterId: string;

  @ApiProperty({ description: 'Heure de pickup demandée', example: '2024-07-12T14:00:00.000Z' })
  @IsDateString()
  requestedTime: string;

  @ApiProperty({ description: 'Lieu de pickup', enum: Location, example: Location.SAINT_DENIS })
  @IsEnum(Location)
  pickupLocation: Location;
}

// DTO pour la validation par les carsitters
export class ValidatePickupDto {
  @ApiProperty({ description: 'ID de la demande de pickup', example: 'pickup-request-uuid' })
  @IsString()
  pickupRequestId: string;

  @ApiProperty({ description: 'Validation du pickup par le carsitter', example: true })
  @IsBoolean()
  isValidated: boolean;

  @ApiPropertyOptional({ description: 'Notes du carsitter', example: 'Véhicule livré avec succès' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO pour vérifier les documents
export class CheckDocumentsDto {
  @ApiProperty({ description: 'ID de l\'utilisateur', example: 'user-uuid' })
  @IsString()
  userId: string;
} 