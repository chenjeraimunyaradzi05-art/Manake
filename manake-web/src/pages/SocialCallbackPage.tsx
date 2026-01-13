import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { completeSocialAuth, SocialProvider } from "../services/socialAuth";
import { useAuth } from "../context/AuthContext";
import {
  safeStorageGetItem,
  safeStorageRemoveItem,
} from "../utils/safeStorage";

const isSupportedProvider = (provider?: string): provider is SocialProvider =>
  provider === "google" || provider === "facebook";

export const SocialCallbackPage = () => {
  const navigate = useNavigate();
  const { provider: rawProvider } = useParams();
  const provider = useMemo(
    () => (isSupportedProvider(rawProvider) ? rawProvider : null),
    [rawProvider],
  );
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state") || undefined;
  const mode =
    (searchParams.get("mode") as "login" | "link" | null) || undefined;

  const { handleAuthSuccess, logout } = useAuth();

  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );
  const [message, setMessage] = useState("Completing sign in...");

  const handleCallback = useCallback(async () => {
    if (!provider) {
      setStatus("error");
      setMessage("Unsupported provider.");
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("Missing authorization code.");
      return;
    }

    const stateKey = `social_oauth_state_${provider}`;
    const storedRaw = safeStorageGetItem(stateKey);
    const stored = storedRaw
      ? (JSON.parse(storedRaw) as { state?: string; redirectUri?: string })
      : null;

    if (stored?.state && state && stored.state !== state) {
      setStatus("error");
      setMessage("State mismatch. Please start the login again.");
      return;
    }

    const redirectUri =
      stored?.redirectUri ||
      `${window.location.origin}/auth/${provider}/callback`;

    try {
      setMessage("Finishing authentication...");
      const response = await completeSocialAuth(provider, {
        code,
        state,
        redirectUri,
        mode,
      });
      handleAuthSuccess({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: {
          name: response.user?.name,
          email: response.user?.email,
          avatar:
            (response.user as { avatar?: string | null } | undefined)?.avatar ??
            null,
        },
      });
      safeStorageRemoveItem(stateKey);
      setStatus("success");
      setMessage("Signed in successfully. Redirecting...");
      setTimeout(() => navigate("/"), 600);
    } catch (err) {
      console.error("Social auth callback failed", err);
      setStatus("error");
      setMessage("Could not sign you in. Please try again.");
      // Clear any possibly stale tokens/state on failure
      logout();
    }
  }, [code, handleAuthSuccess, logout, mode, navigate, provider, state]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="container-custom py-20 flex items-center justify-center">
      <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-lg text-center">
        {status === "pending" ? (
          <Loader2
            className="mx-auto animate-spin text-primary-600"
            size={32}
          />
        ) : null}
        {status === "success" ? (
          <CheckCircle className="mx-auto text-green-600" size={32} />
        ) : null}
        {status === "error" ? (
          <AlertCircle className="mx-auto text-red-600" size={32} />
        ) : null}

        <h1 className="text-xl font-bold text-gray-900 mt-4">
          {status === "success"
            ? "Welcome back!"
            : status === "error"
              ? "Sign in failed"
              : "Signing you in..."}
        </h1>
        <p className="text-gray-600 mt-3">{message}</p>

        {status === "error" ? (
          <button
            onClick={() => navigate("/auth/login")}
            className="btn-primary mt-6"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
};
