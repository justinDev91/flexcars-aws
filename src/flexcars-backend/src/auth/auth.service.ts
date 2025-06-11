import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { addHours } from 'date-fns';
import { MailerService } from '@nestjs-modules/mailer';

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
    private readonly mailerService: MailerService
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
  
    if (!user?.password || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  
    if (!user.emailConfirmed) {
      throw new UnauthorizedException('Veuillez confirmer votre adresse email avant de vous connecter.');
    }
    
    await this.mailerService.sendMail({
       to: email,
       subject: 'Notification de connexion',
       template: 'login-notification',
       context: {
         firstName: user.firstName,
       },
    });
      
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  
    const { password,role, ...rest } = user;
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: rest,
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

    const confirmUrl = `http://localhost:3001/auth/confirm-email?token=${emailConfirmToken}`;

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

  
  async confirmEmail(token: string): Promise<{ message: string }> {
      const user = await this.prisma.user.findFirst({
        where: {
          emailConfirmToken: token,
          emailConfirmExpires: {
            gte: new Date(),
          },
        },
      });
  
      if (!user) {
        throw new BadRequestException('Token invalide ou expiré');
      }
  
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailConfirmed: true,
          emailConfirmToken: null,
          emailConfirmExpires: null,
        },
      });
  
      return { message: 'Email confirmé avec succès !' };
    }
  

}
