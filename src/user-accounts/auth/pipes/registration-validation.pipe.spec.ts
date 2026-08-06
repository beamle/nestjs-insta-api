import { BadRequestException } from '@nestjs/common';
import { RegistrationValidationPipe } from './registration-validation.pipe';

describe('RegistrationValidationPipe', () => {
  let pipe: RegistrationValidationPipe;

  beforeEach(() => {
    pipe = new RegistrationValidationPipe();
  });

  it('accepts valid payload', () => {
    const result = pipe.transform({
      login: 'tester',
      password: 'secret12',
      email: 'test@example.com',
    });

    expect(result).toEqual({
      login: 'tester',
      password: 'secret12',
      email: 'test@example.com',
    });
  });

  it('rejects login too short', () => {
    expect(() =>
      pipe.transform({
        login: 'ab',
        password: 'secret12',
        email: 'test@example.com',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects password too short', () => {
    expect(() =>
      pipe.transform({
        login: 'tester',
        password: '12345',
        email: 'test@example.com',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid email', () => {
    expect(() =>
      pipe.transform({
        login: 'tester',
        password: 'secret12',
        email: 'invalid',
      }),
    ).toThrow(BadRequestException);
  });

  it('returns multiple validation errors', () => {
    try {
      pipe.transform({
        login: 'ab',
        password: '1',
        email: 'bad',
      });
      fail('Should throw');
    } catch (error) {
      const err = error as BadRequestException;
      const response = err.getResponse() as {
        errorsMessages: Array<{ field: string; message: string }>;
      };
      expect(response.errorsMessages.length).toBe(3);
    }
  });
});
