import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class RegistrationEmailService {
  private readonly transporter = this.createTransporter();
  private readonly from = process.env.SMTP_FROM ?? 'no-reply@example.com';
  private readonly confirmationBaseUrl =
    process.env.CONFIRMATION_LINK_BASE_URL ??
    'https://some-front.com/confirm-registration';
  private readonly passwordRecoveryBaseUrl =
    process.env.PASSWORD_RECOVERY_LINK_BASE_URL ??
    'https://some-front.com/password-recovery';

  async sendConfirmationCode(email: string, confirmationCode: string) {
    const confirmationLink = `${this.confirmationBaseUrl}?code=${encodeURIComponent(
      confirmationCode,
    )}`;

    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Email confirmation',
      text: `Confirm your email: ${confirmationLink}`,
      html: `<p>Confirm your email: <a href="${confirmationLink}">${confirmationLink}</a></p>`,
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
      text: `Reset your password: ${recoveryLink}`,
      html: `<p>Reset your password: <a href="${recoveryLink}">${recoveryLink}</a></p>`,
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
