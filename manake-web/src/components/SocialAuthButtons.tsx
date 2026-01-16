import { useState } from "react";
import { AlertCircle, Loader2, Facebook } from "lucide-react";
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

const providerConfig: Record<
  SocialProvider,
  {
    label: string;
    icon: React.ReactNode;
    className: string;
    hoverClassName: string;
  }
> = {
  google: {
    label: "Continue with Google",
    icon: <GoogleIcon />,
    className: "bg-white text-gray-700 border border-gray-300",
    hoverClassName: "hover:bg-gray-50",
  },
  facebook: {
    label: "Continue with Facebook",
    icon: <Facebook className="w-5 h-5 text-white" fill="currentColor" />,
    className: "bg-[#1877F2] text-white border border-transparent",
    hoverClassName: "hover:bg-[#166fe5]",
  },
};

export const SocialAuthButtons = () => {
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
        const data = err.response?.data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start text-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-3">
        {(Object.keys(providerConfig) as SocialProvider[]).map((provider) => {
          const config = providerConfig[provider];
          const isLoading = loadingProvider === provider;

          return (
            <button
              key={provider}
              type="button"
              onClick={() => beginAuth(provider)}
              disabled={loadingProvider !== null}
              className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm ${config.className} ${config.hoverClassName}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="mr-3 flex items-center">{config.icon}</span>
                  {config.label}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
