import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

    
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
      try {
        const result = await this.authService.profiderFindOrCreateUser(profile);
        done(null, result);
      } catch (err) {
        done(err, false);
      }
    }
}