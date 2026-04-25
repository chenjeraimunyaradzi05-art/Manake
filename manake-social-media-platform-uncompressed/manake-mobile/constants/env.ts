type EnvString = string | undefined;

function pickFirst(...values: EnvString[]) {
  return values.find((v) => typeof v === "string" && v.length > 0);
}

export const env = {
  google: {
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
  apple: {
    clientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID,
  },
  api: {
    // Optional override if you want to point the mobile app at a different backend.
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  },
} as const;

export function isGoogleConfigured() {
  const anyId = pickFirst(
    env.google.expoClientId,
    env.google.iosClientId,
    env.google.androidClientId,
    env.google.webClientId,
  );
  return !!anyId;
}

export function isAppleConfigured() {
  return !!env.apple.clientId;
}
