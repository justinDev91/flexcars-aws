import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import { TokenType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TokensService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  findOne(token: string) {
    return this.prisma.token.findUnique({
      where: {
        userId: token,
      },
    });
  }

  async create(userId: string, type: TokenType) {
    const token = await this.prisma.token.create({
      select: {
        id: true,
        user: {
          select: {
            email: true,
            firstName: true,
          },
        },
      },
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        type,
      },
    });

    if (type === TokenType.INVITATION) {
      await this.mailerService.sendMail({
        to: token.user.email,
        subject: 'Welcome to MyGuez',
        template: 'welcome-student',
        context: {
          firstName: token.user.firstName,
          url: `http://localhost:3000/confirm/${token.id}`,
        },
      });
    }
  }
}
