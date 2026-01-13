import { ConfigContext, ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Manake",
  slug: "manake",
  scheme: "manake",
  version: "1.0.0",
  orientation: "portrait",
  platforms: ["ios", "android", "web"],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.manake.app",
  },
  android: {
    package: "com.manake.app",
    intentFilters: [
      {
        action: "VIEW",
        data: [
          {
            scheme: "https",
            host: "manake.app",
            pathPrefix: "/",
          },
          {
            scheme: "manake",
            host: "",
            pathPrefix: "/",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
  },
  extra: {
    eas: {
      projectId: "manake-mobile",
    },
    // Set via Expo public env: EXPO_PUBLIC_SENTRY_DSN (empty disables Sentry)
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
  hooks: {
    postPublish: [],
  },
  splash: {
    backgroundColor: "#FFFFFF",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  // Define app links for navigation targets
  linking: {
    prefixes: ["manake://", "https://manake.app"],
    config: {
      screens: {
        "(tabs)": {
          screens: {
            index: "",
            stories: "stories",
            social: "social",
            messages: "messages",
            profile: "profile",
          },
        },
        "(auth)": {
          screens: {
            login: "login",
            signup: "signup",
            "forgot-password": "forgot-password",
          },
        },
        "story/[id]": "story/:id",
        "profile/[id]": "profile/:id",
        "profile/edit": "profile/edit",
        "webview": "webview",
        "social/post/[id]": "social/post/:id",
      },
    },
  },
};

export default config;
