import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDocumentDto } from './dto/createDocument.dto';
import { UpdateDocumentDto } from './dto/updateDocument.dto';
import { DocumentService } from './document.service';

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.documentService.findById(id);
  }

  @Post()
  create(@Body() data: CreateDocumentDto) {
    return this.documentService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateDocumentDto) {
    return this.documentService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
