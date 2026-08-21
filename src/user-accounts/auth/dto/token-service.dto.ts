export interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
}

export interface TokenService {
  createAccessToken(userId: string): string;
  createRefreshToken(userId: string): string;

  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
