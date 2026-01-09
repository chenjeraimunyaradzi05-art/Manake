import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { env, isAppleConfigured, isGoogleConfigured } from '../constants/env';

WebBrowser.maybeCompleteAuthSession();

function randomNonce() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export type SocialProvider = 'google' | 'apple';

export type GoogleAuthResult =
  | { ok: true; idToken: string; redirectUri: string }
  | { ok: false; error: string };

export type AppleAuthResult =
  | { ok: true; code: string; codeVerifier?: string; redirectUri: string; clientId: string }
  | { ok: false; error: string };

export function makeRedirectUri() {
  // In standalone builds, this becomes your app scheme-based URI.
  // If you use Expo Go in dev, ensure your OAuth redirect URI allows the Expo redirect.
  return AuthSession.makeRedirectUri();
}

export async function startGoogleAuth(): Promise<GoogleAuthResult> {
  if (!isGoogleConfigured()) {
    return {
      ok: false,
      error:
        'Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_*_CLIENT_ID in your environment.',
    };
  }

  const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
  const redirectUri = makeRedirectUri();

  const request = new AuthSession.AuthRequest({
    clientId:
      env.google.expoClientId ||
      env.google.iosClientId ||
      env.google.androidClientId ||
      env.google.webClientId ||
      '',
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    extraParams: {
      nonce: randomNonce(),
    },
  });

  await request.makeAuthUrlAsync(discovery);

  const result = await request.promptAsync(discovery, {
    showInRecents: true,
  });

  if (result.type !== 'success') {
    return { ok: false, error: result.type === 'cancel' ? 'Cancelled' : 'Google sign-in failed' };
  }

  const idToken = (result.params as any)?.id_token;
  if (!idToken) {
    return { ok: false, error: 'Google sign-in did not return an id_token' };
  }

  return { ok: true, idToken, redirectUri };
}

export async function startAppleAuth(): Promise<AppleAuthResult> {
  if (!isAppleConfigured()) {
    return {
      ok: false,
      error: 'Apple sign-in is not configured. Set EXPO_PUBLIC_APPLE_CLIENT_ID in your environment.',
    };
  }

  const discovery: AuthSession.DiscoveryDocument = {
    authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
    tokenEndpoint: 'https://appleid.apple.com/auth/token',
  };

  const redirectUri = makeRedirectUri();
  const clientId = env.apple.clientId ?? '';

  // Note: Apple OAuth code exchange requires a client secret and should be done on your backend.
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ['name', 'email'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    extraParams: {
      response_mode: 'query',
    },
  });

  await request.makeAuthUrlAsync(discovery);

  const result = await request.promptAsync(discovery, {
    showInRecents: true,
  });

  if (result.type !== 'success') {
    return { ok: false, error: result.type === 'cancel' ? 'Cancelled' : 'Apple sign-in failed' };
  }

  const code = (result.params as any)?.code;
  if (!code) {
    return { ok: false, error: 'Apple sign-in did not return an authorization code' };
  }

  // codeVerifier is needed by the backend for PKCE token exchange.
  return { ok: true, code, codeVerifier: request.codeVerifier, redirectUri, clientId };
}
