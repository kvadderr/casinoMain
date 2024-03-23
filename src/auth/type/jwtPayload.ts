import { UserRole } from 'src/constants';

export interface AccessTokenPayload {
  userId: number;
  role: UserRole;
}

export interface RefreshTokenPayload {
  userId: number;
}