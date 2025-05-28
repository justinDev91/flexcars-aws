import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

enum DocumentType {
  ID_CARD = 'ID_CARD',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS'
}

export class CreateDocumentDto {
  @ApiProperty({ description: 'User ID', example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Document type', example: 'ID_CARD' })
  @IsOptional()
  @IsString()
  type?: DocumentType;

  @ApiPropertyOptional({ description: 'File URL', example: 'https://example.com/file.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Verification status', example: false })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
