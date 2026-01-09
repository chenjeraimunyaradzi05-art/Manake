import { useState } from 'react';
import { AlertCircle, Loader2, Shield } from 'lucide-react';
import { SocialProvider, startSocialAuth } from '../services/socialAuth';

const providerMeta: Record<SocialProvider, { label: string; accent: string; text: string }> = {
  google: {
    label: 'Continue with Google',
    accent: 'border border-gray-200 hover:border-gray-300 text-gray-800',
    text: 'Sign in with your Google account.',
  },
  facebook: {
    label: 'Continue with Facebook',
    accent: 'bg-[#1877f2] hover:bg-[#0f6ae6] text-white',
    text: 'Use your Facebook account to sign in.',
  },
};

export const SocialLoginPage = () => {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const beginAuth = async (provider: SocialProvider) => {
    try {
      setError(null);
      setLoadingProvider(provider);
      const redirectUri = `${window.location.origin}/auth/${provider}/callback`;
      const { authUrl, state } = await startSocialAuth(provider, redirectUri);
      localStorage.setItem(
        `social_oauth_state_${provider}`,
        JSON.stringify({ state, redirectUri, ts: Date.now() })
      );
      window.location.href = authUrl;
    } catch (err) {
      console.error('Failed to start social auth', err);
      setError('Unable to start social login. Please try again.');
      setLoadingProvider(null);
    }
  };

  return (
    <div className="container-custom py-16">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-primary-600" size={24} />
          <div>
            <p className="text-sm text-gray-500">Secure Sign In</p>
            <h1 className="text-2xl font-bold text-gray-900">Access your Manake account</h1>
          </div>
        </div>

        <p className="text-gray-600 mb-8">
          Choose a provider below to sign in or link your account. We will redirect you to complete
          authentication, then bring you back here.
        </p>

        <div className="space-y-4">
          {(Object.keys(providerMeta) as Array<SocialProvider>).map((provider) => (
            <button
              key={provider}
              onClick={() => beginAuth(provider)}
              disabled={!!loadingProvider}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                providerMeta[provider].accent
              } ${loadingProvider && 'opacity-75 cursor-not-allowed'}`}
            >
              <span className="font-semibold">{providerMeta[provider].label}</span>
              <span className="text-sm text-gray-600">{providerMeta[provider].text}</span>
              {loadingProvider === provider ? <Loader2 className="animate-spin" size={18} /> : null}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-6 flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
            <AlertCircle size={18} className="mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        ) : null}

        <p className="text-xs text-gray-500 mt-6">
          By continuing, you agree to receive occasional updates about your account and Manake programs.
        </p>
      </div>
    </div>
  );
};
