import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateDocumentDto } from './dto/createDocument.dto';
import { UpdateDocumentDto } from './dto/updateDocument.dto';
import { DocumentService } from './document.service';
import { FileUploadService } from '../utils/file-upload.service';

@ApiBearerAuth('access-token') 
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get documents by user ID' })
  findByUserId(@Param('userId') userId: string) {
    return this.documentService.findByUserId(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.documentService.findById(id);
  }

  @Post()
  create(@Body() data: CreateDocumentDto) {
    return this.documentService.create(data);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        userId: {
          type: 'string',
        },
        type: {
          type: 'string',
          enum: ['ID_CARD', 'DRIVER_LICENSE', 'PROOF_OF_ADDRESS'],
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', FileUploadService.getMulterConfig()))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Body('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (!userId) {
      throw new BadRequestException('userId est requis');
    }

    if (!FileUploadService.validateDocumentType(type)) {
      throw new BadRequestException('Type de document invalide');
    }

    const fileUrl = FileUploadService.getFileUrl(file.filename);

    const document = await this.documentService.create({
      userId,
      type: type as any,
      fileUrl,
      verified: false, // Par défaut non vérifié
    });

    return {
      message: 'Document uploadé avec succès',
      document,
      fileUrl,
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateDocumentDto) {
    return this.documentService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
