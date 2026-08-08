import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class RegistrationEmailService {
  private readonly transporter = this.createTransporter();
  private readonly from = process.env.SMTP_FROM ?? 'no-reply@example.com';

  async sendConfirmationCode(email: string, confirmationCode: string) {
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Email confirmation',
      text: `Your confirmation code is ${confirmationCode}`,
      html: `<p>Your confirmation code is <b>${confirmationCode}</b></p>`,
    });
  }

  private createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 0);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (host && port && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure: String(process.env.SMTP_SECURE ?? '').toLowerCase() === 'true',
        auth: {
          user,
          pass,
        },
      });
    }

    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}
