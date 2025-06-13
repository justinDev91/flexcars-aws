import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { addHours, addMinutes } from 'date-fns';
import { MailerService } from '@nestjs-modules/mailer';
import { sendEmail } from 'src/utils/sendEmail';
import { generateRandomPassword } from 'src/utils/generateRandomPassword';

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
  
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  
    if (user.lockUntil && user.lockUntil > new Date()) {
      
      const resetUrl = `http://localhost:3000/auth/forgot-password`;

      await sendEmail(
        this.mailerService,
        email,
        'Compte temporairement bloqué',
        'account-locked',
        {
          firstName: user.firstName,
          lockUntil: user.lockUntil.toLocaleString('fr-FR'),
          url: resetUrl,
        }
      );

      throw new UnauthorizedException('Compte temporairement bloqué. Réessayez plus tard.');
    }
  
    const isPasswordValid = await bcrypt.compare(pass, user.password as string);

    if (!isPasswordValid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          lockUntil: user.failedLoginAttempts + 1 >= 5 ? addMinutes(new Date(), 15) : undefined,
        },
      });
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  
    if (!user.emailConfirmed) {
      throw new UnauthorizedException('Veuillez confirmer votre adresse email avant de vous connecter.');
    }
  
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
    if (user.passwordLastReset < sixtyDaysAgo) {
      
      const resetUrl = `http://localhost:3000/auth/reset-password`;

        await sendEmail(
          this.mailerService,
          email,
          'Votre mot de passe a expiré',
          'password-expired',
          {
            firstName: user.firstName,
            url: resetUrl,
          }
        );
      throw new UnauthorizedException('Veuillez réinitialiser votre mot de passe. Cela fait plus de 60 jours.');
    }
  
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    });
  
    const resetUrl = `http://localhost:3000/auth/forgot-password`;
  
    await sendEmail(
      this.mailerService,
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
  
    const { password, role, ...rest } = user;
  
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

    
    await sendEmail(
      this.mailerService,
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

    await sendEmail(
        this.mailerService,
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
  
  
    await sendEmail(
      this.mailerService,
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
        passwordLastReset: new Date(),
      },
    });
    
    const resetUrl = `http://localhost:3000/auth/forgot-password`;

    await sendEmail(
      this.mailerService,
      user.email,
      'Réinitialisation de votre mot de passe',
      'password-reseted',
      { firstName: user.firstName, url: resetUrl }
    );
  
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async profiderFindOrCreateUser(profile: any): Promise<{ access_token: string; user: any }> {
    const {
      email_verified,
      email,
      given_name: firstName,
      family_name: lastName,
      sub: providerId,
      picture: avatar,
    } = profile._json;

    if (!email_verified) {
      throw new UnauthorizedException('Email Google non vérifié.');
    }

    let user = await this.prisma.user.findFirst({
      where: {
        provider: 'google',
        providerId,
      },
    });

    if (!user) {
      const randomPassword = generateRandomPassword(12);

      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: randomPassword,
          provider: 'google',
          providerId,
          avatar,
          emailConfirmed: true,
        },
      });
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user,
    };
  }
  
}
