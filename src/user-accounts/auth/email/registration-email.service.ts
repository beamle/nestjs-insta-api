import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class RegistrationEmailService {
  private readonly transporter = this.createTransporter();
  private readonly from = process.env.SMTP_FROM ?? 'no-reply@example.com';
  private readonly confirmationBaseUrl =
    process.env.CONFIRMATION_LINK_BASE_URL ??
    'https://somesite.com/confirm-email';
  private readonly passwordRecoveryBaseUrl =
    process.env.PASSWORD_RECOVERY_LINK_BASE_URL ??
    'https://somesite.com/password-recovery';

  async sendConfirmationCode(email: string, confirmationCode: string) {
    const confirmationLink = `${this.confirmationBaseUrl}?code=${encodeURIComponent(
      confirmationCode,
    )}`;

    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Email confirmation',
      text: `https://somesite.com/confirm-email?code=${confirmationCode}`,
      html: `<h1>Thank for your registration</h1><p>To finish registration please follow the link below:<a href='${confirmationLink}'>complete registration</a></p>`,
    });
  }

  async sendPasswordRecoveryCode(email: string, recoveryCode: string) {
    const recoveryLink = `${this.passwordRecoveryBaseUrl}?recoveryCode=${encodeURIComponent(
      recoveryCode,
    )}`;

    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Password recovery',
      text: `https://somesite.com/password-recovery?recoveryCode=${recoveryCode}`,
      html: `<h1>Password recovery</h1><p>To recover your password please follow the link below:<a href='${recoveryLink}'>recovery password</a></p>`,
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
