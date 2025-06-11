import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { addHours } from 'date-fns';

interface registerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user?.password || !(await bcrypt.compare(pass, user?.password))) {
      throw new UnauthorizedException();
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const { password, ...userWithoutPassword } = user;

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userWithoutPassword,
    };
  }

 
  async register(params: registerData) {
    const { email, password, firstName, lastName } = params;

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailConfirmToken = randomBytes(32).toString('hex');
    const emailConfirmExpires = addHours(new Date(), 24); 

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailConfirmToken,
        emailConfirmExpires,
      },
    });

    //Utiliser la varaible: http://localhost:3001/confirm-email/

    const confirmUrl = `https://yourdomain.com/confirm-email?token=${emailConfirmToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirmez votre adresse email',
      template: 'welcome-student',
      context: {
        firstName,
        url: confirmUrl,
      },
    });

    return { message: 'User registered. Please confirm your email.' };
  }

}
