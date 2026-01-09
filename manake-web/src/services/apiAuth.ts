import { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import api from './api';
import { refreshTokens } from './auth';

export type InterceptorOptions = {
  getRefreshToken: () => string | null;
  onTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;
  onLogout: () => void;
};

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const setupAuthInterceptors = (
  client: AxiosInstance = api,
  options: InterceptorOptions
): void => {
  let refreshPromise: Promise<string> | null = null;

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const response = error.response;
      const originalRequest = error.config as RetriableConfig;

      if (!response || response.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = options.getRefreshToken();
      if (!refreshToken) {
        options.onLogout();
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = refreshTokens(refreshToken)
          .then((tokens) => {
            options.onTokens(tokens);
            refreshPromise = null;
            return tokens.accessToken;
          })
          .catch((refreshError) => {
            refreshPromise = null;
            options.onLogout();
            throw refreshError;
          });
      }

      try {
        const newAccessToken = await refreshPromise;
        if (!originalRequest.headers) {
          originalRequest.headers = new AxiosHeaders();
        }
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
  );
};

export const setupAuthRequestInterceptor = (client: AxiosInstance = api): void => {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });
};
