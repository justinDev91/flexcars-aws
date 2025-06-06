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
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Response } from 'express';
import { Public } from 'src/decorators/Public';
import { CreateOrUpdateUserDto } from './dto/createOrUpdateUser';
import { FindAllUsersDto } from './dto/usersList';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser.dto';

interface RequestWithUser extends Request {
  user: User;
}
@ApiBearerAuth('access-token') 
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: FindAllUsersDto): Promise<Omit<User, 'role' | 'password'>[]>  {
    return await this.usersService.findAll(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id): Promise<Omit<User, 'role' | 'password'>> {
    return await this.usersService.findById(id);
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
