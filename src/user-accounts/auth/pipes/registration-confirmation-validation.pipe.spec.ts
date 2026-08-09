import { BadRequestException } from '@nestjs/common';
import { RegistrationConfirmationValidationPipe } from './registration-confirmation-validation.pipe';

describe('RegistrationConfirmationValidationPipe', () => {
  let pipe: RegistrationConfirmationValidationPipe;

  beforeEach(() => {
    pipe = new RegistrationConfirmationValidationPipe();
  });

  it('accepts a valid confirmation code', () => {
    expect(
      pipe.transform({
        code: 'ABC123',
      }),
    ).toEqual({
      code: 'ABC123',
    });
  });

  it('rejects missing confirmation code', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });
});
