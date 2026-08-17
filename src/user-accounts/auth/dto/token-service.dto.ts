export interface TokenPayload {
  userId: string;
}

export interface TokenService {
  createAccessToken(userId: string): string;
  createRefreshToken(userId: string): string;

  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
