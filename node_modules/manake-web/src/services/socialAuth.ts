import api from './api';

export type SocialProvider = 'google' | 'facebook';

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  avatar?: string;
};

type StartResponse = {
  authUrl: string;
  state: string;
};

type CallbackResponse = {
  message: string;
  user: AuthUser;
  socialAccount: unknown;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

export const startSocialAuth = async (
  provider: SocialProvider,
  redirectUri: string
): Promise<StartResponse> => {
  const { data } = await api.get(`/v1/social/${provider}/authorize`, {
    params: { redirectUri },
  });
  return data as StartResponse;
};

export const completeSocialAuth = async (
  provider: SocialProvider,
  params: { code: string; state?: string; redirectUri?: string; mode?: 'login' | 'link' }
): Promise<CallbackResponse> => {
  const { data } = await api.get(`/v1/social/${provider}/callback`, {
    params,
  });
  return data as CallbackResponse;
};
