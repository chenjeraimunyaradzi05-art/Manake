import React from "react";
import { useSuggestions, useSendConnectionRequest } from "../../hooks/useConnections";
import { ConnectionUser } from "../../services/connectionService";

interface SuggestionCardViewProps {
  user: ConnectionUser;
  onConnect: () => void;
  isConnecting: boolean;
}

export const SuggestionCardView: React.FC<SuggestionCardViewProps> = ({
  user,
  onConnect,
  isConnecting,
}) => {
  return (
    <li className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={user.avatar || "/images/default-avatar.png"}
          alt=""
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{user.name}</p>
          {user.profile?.headline && (
            <p className="text-sm text-gray-500 truncate">{user.profile.headline}</p>
          )}
        </div>
      </div>
      {user.profile?.bio && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{user.profile.bio}</p>
      )}
      <button
        onClick={onConnect}
        disabled={isConnecting}
        aria-label={`Connect with ${user.name}`}
        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {isConnecting ? "Sending..." : "Connect"}
      </button>
    </li>
  );
};

export const ConnectionSuggestions: React.FC = () => {
  const { data: suggestions, isLoading, error, refetch } = useSuggestions(10);
  const sendRequest = useSendConnectionRequest();

  if (isLoading) {
    return (
      <section aria-label="Suggestions loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center" role="alert">
        <p className="text-red-600 mb-2">Failed to load suggestions</p>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">No suggestions available right now</p>
      </div>
    );
  }

  return (
    <section aria-label="People you may know">
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((user) => (
          <SuggestionCardView
            key={user._id}
            user={user}
            isConnecting={sendRequest.isPending}
            onConnect={() => sendRequest.mutate({ targetUserId: user._id })}
          />
        ))}
      </ul>
    </section>
  );
};
