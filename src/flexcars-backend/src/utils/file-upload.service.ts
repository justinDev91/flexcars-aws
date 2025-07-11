import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  static getMulterConfig() {
    return {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accepter seulement les images et PDFs
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'application/pdf'
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Type de fichier non autorisé. Seuls JPG, PNG et PDF sont acceptés.'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
    };
  }

  static validateDocumentType(documentType: string): boolean {
    const validTypes = ['ID_CARD', 'DRIVER_LICENSE', 'PROOF_OF_ADDRESS'];
    return validTypes.includes(documentType);
  }

  static getFileUrl(filename: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/uploads/documents/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      await fs.unlink(path.join('./uploads/documents', filename));
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }
  }
} 