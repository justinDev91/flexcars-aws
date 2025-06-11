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
  
  private async sendEmail(
      to: string,
      subject: string,
      template: string,
      context: Record<string, any>
    ): Promise<void> {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
  }
  
  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
  
    if (!user?.password || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  
    if (!user.emailConfirmed) {
      throw new UnauthorizedException('Veuillez confirmer votre adresse email avant de vous connecter.');
    }
    
    const resetUrl = `http://localhost:3000/auth/forgot-password`;

    await this.sendEmail(
        email,
        'Notification de connexion',
        'login-notification',
        { firstName: user.firstName, url: resetUrl }
      );
      
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

    const confirmUrl = `http://localhost:3000/auth/confirm-email?token=${emailConfirmToken}`;

    
    await this.sendEmail(
      email,
      'Confirmez votre adresse email',
      'welcome-customer',
      { firstName, url: confirmUrl }
    );

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

    const resetUrl = `http://localhost:3000/auth/login`;

    await this.sendEmail(
        user.email,
        'Confirmation de mail confirmé',
        'email-confirmed',
        { firstName: user.firstName, url: resetUrl }
      );
  
      return { message: 'Email confirmé avec succès !' };
    }

  async forgotMyPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException("Aucun utilisateur trouvé avec cet email.");
    }
  
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = addHours(new Date(), 1); 
  
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });
    
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
  
  
    await this.sendEmail(
      email,
      'Réinitialisation de votre mot de passe',
      'reset-password',
      { firstName: user.firstName, url: resetUrl }
    );
  
  
    return { message: 'Un email de réinitialisation a été envoyé.' };
  }
  
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(),
        },
      },
    });
  
    if (!user) {
      throw new BadRequestException('Token invalide ou expiré.');
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    
    const resetUrl = `http://localhost:3000/auth/forgot-password`;

    
    await this.sendEmail(
      user.email,
      'Réinitialisation de votre mot de passe',
      'password-reseted',
      { firstName: user.firstName, url: resetUrl }
    );
  
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
  
}
