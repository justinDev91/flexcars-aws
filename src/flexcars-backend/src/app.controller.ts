import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/Public';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('send-email')
  @Public()
  sendEmail() {
    return this.appService.sendTestEmail();
  }
  @Get("/debug-sentry")
  @Public()
  getError() {
    throw new Error("My first Sentry error!");
  }
}
