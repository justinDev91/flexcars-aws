import { MailerService } from '@nestjs-modules/mailer';

export const sendEmail = async (
  mailerService: MailerService,
  to: string,
  subject: string,
  template: string,
  context: Record<string, any>
): Promise<void> => {
  await mailerService.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to,
    subject,
    template,
    context,
  });
};
