import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma.service';

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

  updateUser(id: string, data: Prisma.UserCreateInput) {
    return this.prisma.user.update({
      data,
      where: {
        id,
      },
    });
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
