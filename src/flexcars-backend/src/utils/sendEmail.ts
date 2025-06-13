import { MailerService } from '@nestjs-modules/mailer';

export const sendEmail = async (
  mailerService: MailerService,
  to: string,
  subject: string,
  template: string,
  context: Record<string, any>
): Promise<void> => {
  await mailerService.sendMail({
    to,
    subject,
    template,
    context,
  });
};
