import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Response } from 'express';
import { Public } from 'src/decorators/Public';
import { CreateOrUpdateUserDto } from './dto/createOrUpdateUser';
import { FindAllUsersDto } from './dto/usersList';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GdprService } from './gdpr.service';

interface RequestWithUser extends Request {
  user: User;
}
@ApiBearerAuth('access-token') 
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly gdprService: GdprService
  ) {}

  @Get()
  async findAll(@Query() query: FindAllUsersDto): Promise<Omit<User, 'role' | 'password'>[]>  {
    return await this.usersService.findAll(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id): Promise<Omit<User, 'role' | 'password'>> {
    return await this.usersService.findById(id);
  }

  @Get('/:id/data-export')
  @ApiParam({ name: 'id' })
  @ApiOperation({ 
    summary: 'Export user data (GDPR Article 20)', 
    description: 'Export all personal data for the user in a machine-readable format' 
  })
  async exportUserData(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.gdprService.exportUserData(id);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=user-data-export-${id}.json`);
      res.json(data);
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      res.status(500).json({ message: 'Erreur lors de l\'export des données' });
    }
  }

  @Get('/:id/consents')
  @ApiParam({ name: 'id' })
  @ApiOperation({ 
    summary: 'Get user consents (GDPR Article 7)', 
    description: 'Retrieve information about user consents' 
  })
  async getUserConsents(@Param('id') id: string) {
    return await this.gdprService.getUserConsents(id);
  }

  @Post()
  async createUser(@Body() createUser: CreateOrUpdateUserDto): Promise<Omit<User, 'role' | 'password'>> {
    return await this.usersService.createUser(createUser);
  }

  @Put('password')
  @Public()
  async updatePassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return await this.usersService.updatePassword(token, password);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUser: UpdateUserDto,
  ) : Promise<Omit<User, 'role' | 'password'>>{
    return await this.usersService.updateUser(id, updateUser);
  }

  @Post(':id/anonymize')
  @ApiParam({ name: 'id' })
  @ApiOperation({ 
    summary: 'Anonymize user data (GDPR Article 17)', 
    description: 'Anonymize user personal data while preserving necessary business records' 
  })
  async anonymizeUser(@Param('id') id: string, @Res() res: Response) {
    try {
      // Vérifier s'il y a des réservations actives
      const hasActiveReservations = await this.gdprService.hasActiveReservations(id);
      
      if (hasActiveReservations) {
        throw new BadRequestException(
          'Impossible d\'anonymiser les données : des réservations sont en cours. Veuillez terminer ou annuler toutes vos réservations actives.'
        );
      }

      await this.gdprService.anonymizeUserData(id);
      
      res.status(HttpStatus.OK).json({ 
        message: 'Données utilisateur anonymisées avec succès',
        anonymizedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'anonymisation:', error);
      
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de l\'anonymisation des données' });
      }
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.usersService.deleteUser(id);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error(error);

      res.status(500).json('Something went wrong');
    }
  }
}
