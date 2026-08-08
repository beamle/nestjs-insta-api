import nodemailer from 'nodemailer';
import { RegistrationEmailService } from './registration-email.service';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

describe('RegistrationEmailService', () => {
  const sendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail,
    });
  });

  it('sends confirmation link with code query param', async () => {
    const service = new RegistrationEmailService();

    await service.sendConfirmationCode('test@example.com', 'ABC123');

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        text: expect.stringContaining(
          'https://some-front.com/confirm-registration?code=ABC123',
        ),
        html: expect.stringContaining(
          'https://some-front.com/confirm-registration?code=ABC123',
        ),
      }),
    );
  });
});
