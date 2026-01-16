import api from "./api";

export type UserProfile = {
  id: string;
  _id: string;
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

export type LoginParams = {
  email: string;
  password?: string;
};

export type RegisterParams = {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
};

export async function login(
  params: LoginParams,
): Promise<TokenPair & { user: UserProfile }> {
  const { data } = await api.post("/v1/auth/login", params);
  return data;
}

export async function register(
  params: RegisterParams,
): Promise<TokenPair & { user: UserProfile }> {
  const { data } = await api.post("/v1/auth/register", params);
  return data;
}

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await api.get("/v1/auth/profile");
  return data as UserProfile;
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const { data } = await api.post("/v1/auth/refresh", { refreshToken });
  return data as TokenPair;
}
