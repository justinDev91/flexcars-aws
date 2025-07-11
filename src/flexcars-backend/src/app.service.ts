import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  constructor(private readonly mailerService: MailerService) {}
  
  
async sendTestEmail() {
      const SentMessageInfo = await this.mailerService.sendMail({
        to: 'justinkatasi.jk@gmail.com',
        subject: 'Bienvenue chez nous !',
        template: 'welcome-customer',
        context: {
          firstName: 'Justin',
          url: 'https://example.com/verify-account',
        },
      });
    console.log('Email sent successfully:', SentMessageInfo);
  }

  getHello(): string {
      return 'Hello World!';
  }


}
