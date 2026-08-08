import { BadRequestException } from '@nestjs/common';
import { RegistrationEmailResendingValidationPipe } from './registration-email-resending-validation.pipe';

describe('RegistrationEmailResendingValidationPipe', () => {
  let pipe: RegistrationEmailResendingValidationPipe;

  beforeEach(() => {
    pipe = new RegistrationEmailResendingValidationPipe();
  });

  it('accepts a valid email', () => {
    expect(pipe.transform({ email: 'test@example.com' })).toEqual({
      email: 'test@example.com',
    });
  });

  it('rejects invalid email', () => {
    expect(() => pipe.transform({ email: 'bad' })).toThrow(
      BadRequestException,
    );
  });
});
