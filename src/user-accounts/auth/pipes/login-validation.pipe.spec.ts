import { BadRequestException } from '@nestjs/common';
import { LoginValidationPipe } from './login-validation.pipe';

describe('LoginValidationPipe', () => {
  let pipe: LoginValidationPipe;

  beforeEach(() => {
    pipe = new LoginValidationPipe();
  });

  it('accepts valid payload', () => {
    expect(
      pipe.transform({
        loginOrEmail: 'user@example.com',
        password: 'secret12',
      }),
    ).toEqual({
      loginOrEmail: 'user@example.com',
      password: 'secret12',
    });
  });

  it('rejects invalid payload', () => {
    expect(() =>
      pipe.transform({
        loginOrEmail: '',
        password: '',
      }),
    ).toThrow(BadRequestException);
  });
});
