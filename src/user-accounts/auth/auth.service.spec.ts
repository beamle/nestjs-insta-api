import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const usersRepository = {
    findByLogin: jest.fn(),
    findByEmail: jest.fn(),
    findByLoginOrEmail: jest.fn(),
    findByConfirmationCode: jest.fn(),
    findByPasswordRecoveryCode: jest.fn(),
    create: jest.fn(),
    confirmEmail: jest.fn(),
    updateConfirmationCode: jest.fn(),
    updatePasswordRecoveryCode: jest.fn(),
    updatePasswordWithRecoveryCode: jest.fn(),
  };
  const registrationEmailService = {
    sendConfirmationCode: jest.fn(),
    sendPasswordRecoveryCode: jest.fn(),
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

  it('returns access token for valid credentials', async () => {
    usersRepository.findByLoginOrEmail.mockResolvedValue({
      _id: { toString: () => 'user-id' },
      password: 'secret12',
    });

    const result = await service.login({
      loginOrEmail: 'tester',
      password: 'secret12',
    });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.accessToken.length).toBeGreaterThan(10);
  });

  it('throws 401 for wrong credentials', async () => {
    usersRepository.findByLoginOrEmail.mockResolvedValue(null);

    await expect(
      service.login({
        loginOrEmail: 'tester',
        password: 'wrong',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns 204 behavior for non-existing password recovery email', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.passwordRecovery({
        email: 'missing@example.com',
      }),
    ).resolves.toBeUndefined();

    expect(usersRepository.updatePasswordRecoveryCode).not.toHaveBeenCalled();
    expect(registrationEmailService.sendPasswordRecoveryCode).not.toHaveBeenCalled();
  });

  it('sends recovery email for existing user', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: '1',
    });
    usersRepository.updatePasswordRecoveryCode.mockResolvedValue(undefined);

    await expect(
      service.passwordRecovery({
        email: 'existing@example.com',
      }),
    ).resolves.toBeUndefined();

    expect(usersRepository.updatePasswordRecoveryCode).toHaveBeenCalledWith(
      'existing@example.com',
      expect.any(String),
      expect.any(Date),
    );
    expect(registrationEmailService.sendPasswordRecoveryCode).toHaveBeenCalledWith(
      'existing@example.com',
      expect.any(String),
    );
  });

  it('sets new password by valid recovery code', async () => {
    usersRepository.findByPasswordRecoveryCode.mockResolvedValue({
      _id: { toString: () => 'user-id' },
      passwordRecoveryCodeExpiresAt: new Date(Date.now() + 60_000),
    });
    usersRepository.updatePasswordWithRecoveryCode.mockResolvedValue(undefined);

    await expect(
      service.setNewPassword({
        newPassword: 'newPassword1',
        recoveryCode: 'RECOVERY',
      }),
    ).resolves.toBeUndefined();

    expect(usersRepository.updatePasswordWithRecoveryCode).toHaveBeenCalledWith(
      'user-id',
      'newPassword1',
    );
  });

  it('rejects invalid or expired recovery code', async () => {
    usersRepository.findByPasswordRecoveryCode.mockResolvedValue(null);

    await expect(
      service.setNewPassword({
        newPassword: 'newPassword1',
        recoveryCode: 'BAD',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
