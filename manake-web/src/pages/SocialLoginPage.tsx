import { useState } from "react";
import { AlertCircle, Loader2, Shield, Facebook } from "lucide-react";
import { isAxiosError } from "axios";
import { SocialProvider, startSocialAuth } from "../services/socialAuth";
import { safeStorageSetItem } from "../utils/safeStorage";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const providerMeta: Record<
  SocialProvider,
  {
    label: string;
    accent: string;
    text: string;
    icon: React.ReactNode;
    descColor: string;
  }
> = {
  google: {
    label: "Continue with Google",
    accent:
      "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-900",
    text: "Sign in with your Google account.",
    icon: <GoogleIcon />,
    descColor: "text-gray-500",
  },
  facebook: {
    label: "Continue with Facebook",
    accent:
      "bg-[#1877f2] hover:bg-[#166fe5] text-white border border-transparent",
    text: "Use your Facebook account to sign in.",
    icon: <Facebook className="w-5 h-5 text-white" fill="currentColor" />,
    descColor: "text-blue-100",
  },
};

export const SocialLoginPage = () => {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const beginAuth = async (provider: SocialProvider) => {
    try {
      setError(null);
      setLoadingProvider(provider);
      const redirectUri = `${window.location.origin}/auth/${provider}/callback`;
      const { authUrl, state } = await startSocialAuth(provider, redirectUri);
      safeStorageSetItem(
        `social_oauth_state_${provider}`,
        JSON.stringify({ state, redirectUri, ts: Date.now() }),
      );
      window.location.href = authUrl;
    } catch (err) {
      console.error("Failed to start social auth", err);
      let errorMessage = "Unable to start social login. Please try again.";

      if (isAxiosError(err)) {
        const data = err.response?.data as {
          error?: { message?: string };
          message?: string;
        };
        if (data?.error?.message) {
          errorMessage = data.error.message;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (err.code === "ERR_NETWORK") {
          errorMessage =
            "Cannot connect to server. Please ensure the backend is running (npm run dev:server).";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="container-custom py-16">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary-50 p-3 rounded-full">
            <Shield className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Secure Access
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to Manake
            </h1>
          </div>
        </div>

        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          Sign in or create a new account in seconds. We’ll redirect you to
          authenticate securely and bring you right back.
        </p>

        <div className="space-y-4">
          {(Object.keys(providerMeta) as Array<SocialProvider>).map(
            (provider) => (
              <button
                key={provider}
                onClick={() => beginAuth(provider)}
                disabled={!!loadingProvider}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition shadow-sm hover:shadow-md ${
                  providerMeta[provider].accent
                } ${loadingProvider && "opacity-75 cursor-not-allowed"}`}
              >
                <div className="shrink-0 flex items-center justify-center w-8 h-8">
                  {loadingProvider === provider ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    providerMeta[provider].icon
                  )}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-lg leading-tight">
                    {providerMeta[provider].label}
                  </span>
                  <span
                    className={`text-sm font-medium ${providerMeta[provider].descColor}`}
                  >
                    {providerMeta[provider].text}
                  </span>
                </div>
              </button>
            ),
          )}
        </div>

        {error ? (
          <div className="mt-6 flex items-start gap-3 text-red-700 bg-red-50 border border-red-100 p-4 rounded-xl">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : null}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to receive occasional updates about your
            account and Manake programs. You can manage these in your settings.
          </p>
        </div>
      </div>
    </div>
  );
};
