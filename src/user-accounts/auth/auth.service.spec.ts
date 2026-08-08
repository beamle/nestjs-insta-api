import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const usersRepository = {
    findByLogin: jest.fn(),
    findByEmail: jest.fn(),
    findByConfirmationCode: jest.fn(),
    create: jest.fn(),
    confirmEmail: jest.fn(),
    updateConfirmationCode: jest.fn(),
  };
  const registrationEmailService = {
    sendConfirmationCode: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      usersRepository as never,
      registrationEmailService as never,
    );
  });

  it('registers a user', async () => {
    usersRepository.findByLogin.mockResolvedValue(null);
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.create.mockResolvedValue(undefined);

    await expect(
      service.register({
        login: 'tester',
        password: 'secret12',
        email: 'test@example.com',
      }),
    ).resolves.toBeUndefined();

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        login: 'tester',
        password: 'secret12',
        email: 'test@example.com',
        isEmailConfirmed: false,
        confirmationCode: expect.any(String),
        confirmationCodeExpiresAt: expect.any(Date),
      }),
    );
    expect(registrationEmailService.sendConfirmationCode).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
    );
  });

  it('rejects duplicate login or email', async () => {
    usersRepository.findByLogin.mockResolvedValue({ id: '1' });
    usersRepository.findByEmail.mockResolvedValue({ id: '2' });

    await expect(
      service.register({
        login: 'tester',
        password: 'secret12',
        email: 'test@example.com',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirms registration by code', async () => {
    usersRepository.findByConfirmationCode.mockResolvedValue({
      _id: {
        toString: () => 'user-id',
      },
      isEmailConfirmed: false,
      confirmationCodeExpiresAt: new Date(Date.now() + 60_000),
    });
    usersRepository.confirmEmail.mockResolvedValue(undefined);

    await expect(
      service.confirmRegistration({
        confirmationCode: 'ABC123',
      }),
    ).resolves.toBeUndefined();

    expect(usersRepository.confirmEmail).toHaveBeenCalledWith('user-id');
  });

  it('rejects invalid confirmation code', async () => {
    usersRepository.findByConfirmationCode.mockResolvedValue(null);

    await expect(
      service.confirmRegistration({
        confirmationCode: 'BADCODE',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('resends confirmation email for unconfirmed user', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      isEmailConfirmed: false,
    });
    usersRepository.updateConfirmationCode.mockResolvedValue(undefined);

    await expect(
      service.resendConfirmationEmail({
        email: 'test@example.com',
      }),
    ).resolves.toBeUndefined();

    expect(usersRepository.updateConfirmationCode).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
      expect.any(Date),
    );
    expect(registrationEmailService.sendConfirmationCode).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
    );
  });

  it('rejects resend for confirmed user', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      isEmailConfirmed: true,
    });

    await expect(
      service.resendConfirmationEmail({
        email: 'test@example.com',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
