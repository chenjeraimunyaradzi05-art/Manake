import api from './api';

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  avatar?: string | null;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await api.get('/v1/auth/profile');
  return data as UserProfile;
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const { data } = await api.post('/v1/auth/refresh', { refreshToken });
  return data as TokenPair;
}
