export class CreateUserDto {
  login: string;
  password: string;
  email: string;
  isEmailConfirmed?: boolean;
  confirmationCode?: string | null;
  confirmationCodeExpiresAt?: Date | null;
}
