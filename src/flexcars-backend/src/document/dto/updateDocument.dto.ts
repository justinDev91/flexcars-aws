import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDocumentDto {
  @ApiPropertyOptional({ description: 'Updated file URL' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Updated verification status' })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
