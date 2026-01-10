import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";

const providers = [
  { id: "google", label: "Continue with Google" },
  { id: "facebook", label: "Continue with Facebook" },
];

export const SocialAuthButtons = () => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleClick = async (provider: string) => {
    const token = window.prompt(
      `Paste your ${provider} ID/access token to sign in`,
    );
    if (!token) return;

    setLoadingProvider(provider);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/v1/social/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Social sign-in failed");
      }

      setMessage(`Signed in as ${data?.user?.email || "your account"}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        Use your Google or Facebook account. You may need to paste a token while
        we finish the full redirect flow.
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleClick(provider.id)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:border-primary-500 hover:text-primary-700"
            disabled={!!loadingProvider}
          >
            {loadingProvider === provider.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {provider.label}
          </button>
        ))}
      </div>
      {message && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};
