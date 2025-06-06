import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

 
  async findAll(params: { page: number; limit: number }):Promise<Omit<User, 'role'>[]>   {
    const { page, limit } = params;

    const users = await this.prisma.user.findMany({
      skip: limit * (page - 1),
      take: limit,
    });
    return users.map(({ role, ...rest }) => rest);
  }

  async findById(id: string) {
   const record = await this.prisma.user.findUnique({ where: { id } });
      if (!record) throw new NotFoundException('User not found');
      return record;
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  createUser(data: Prisma.UserCreateInput) {
    //TODO ne pas passer le role 
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: UpdateUserDto) :  Promise<Omit<User, 'role' | 'password'>>{
   const {role, password, ...rest} = await this.prisma.user.update({
      data,
      where: {
        id,
      },
    });
    return rest;
  }

  async updatePassword(token: string, password: string) {
    const foundToken = await this.prisma.token.findFirstOrThrow({
      select: {
        userId: true,
      },
      where: {
        id: token,
      },
    });

    await this.prisma.user.update({
      data: {
        password: await bcrypt.hash(password, 10),
      },
      where: {
        id: foundToken.userId,
      },
    });

    await this.prisma.token.update({
      data: {
        usedAt: new Date(),
      },
      where: {
        id: token,
      },
    });
  }

  deleteUser(id: string) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
