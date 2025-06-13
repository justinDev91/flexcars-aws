import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiExcludeEndpoint, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerDto';
import { SignInDto } from './dto/signInDto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOAuthGuard } from './google-oauth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiBody({ type: SignInDto })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiBody({ type: RegisterDto })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('confirm-email')
  @ApiOperation({ summary: 'Confirmation de l\'email' })
  @ApiQuery({ name: 'token', required: true, description: 'Token de confirmation' })
  @Public()
  async confirmEmail(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Demande de réinitialisation de mot de passe' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      email: { type: 'string', example: 'user@example.com' }
    }
  }})
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotMyPassword(email);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Réinitialisation du mot de passe' })
  @ApiQuery({ name: 'token', required: true, description: 'Token de réinitialisation' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      password: { type: 'string', example: 'NouveauMotDePasse123!' }
    }
  }})
  resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    // Passport redirige automatiquement
  }

  @ApiExcludeEndpoint()
  @Get('google/redirect')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req) {
    const { user } = req;
    return {
      message: 'Authentification Google réussie',
      access_token: user.access_token,
      user: user.user,
    };
  }

}
