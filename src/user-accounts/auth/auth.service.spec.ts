import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const usersRepository = {
    findByLogin: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
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
});
