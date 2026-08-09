import { BadRequestException } from '@nestjs/common';
import { NewPasswordValidationPipe } from './new-password-validation.pipe';

describe('NewPasswordValidationPipe', () => {
  let pipe: NewPasswordValidationPipe;

  beforeEach(() => {
    pipe = new NewPasswordValidationPipe();
  });

  it('accepts valid payload', () => {
    expect(
      pipe.transform({
        newPassword: 'newPassword1',
        recoveryCode: 'RECOVERY',
      }),
    ).toEqual({
      newPassword: 'newPassword1',
      recoveryCode: 'RECOVERY',
    });
  });

  it('rejects invalid payload', () => {
    expect(() =>
      pipe.transform({
        newPassword: '123',
        recoveryCode: '',
      }),
    ).toThrow(BadRequestException);
  });
});
