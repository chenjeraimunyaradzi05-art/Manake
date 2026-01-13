import React from "react";
import { useConnectionRequests, useRespondToRequest } from "../../hooks/useConnections";
import { ConnectionRequest } from "../../services/connectionService";

interface ConnectionRequestItemViewProps {
  request: ConnectionRequest;
  onAccept: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export const ConnectionRequestItemView: React.FC<ConnectionRequestItemViewProps> = ({
  request,
  onAccept,
  onReject,
  isLoading,
}) => {
  const user = request.userId;

  return (
    <li className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <img
          src={user.avatar || "/images/default-avatar.png"}
          alt=""
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          {user.profile?.headline && (
            <p className="text-sm text-gray-500">{user.profile.headline}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          disabled={isLoading}
          aria-label={`Accept connection request from ${user.name}`}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          disabled={isLoading}
          aria-label={`Decline connection request from ${user.name}`}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </li>
  );
};

export const ConnectionRequests: React.FC = () => {
  const { data: requests, isLoading, error, refetch } = useConnectionRequests();
  const respondMutation = useRespondToRequest();

  if (isLoading) {
    return (
      <section aria-label="Connection requests loading">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center" role="alert">
        <p className="text-red-600 mb-2">Failed to load connection requests</p>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">No pending connection requests</p>
      </div>
    );
  }

  return (
    <section aria-label="Pending connection requests">
      <ul className="space-y-3">
        {requests.map((request) => (
          <ConnectionRequestItemView
            key={request._id}
            request={request}
            isLoading={respondMutation.isPending}
            onAccept={() =>
              respondMutation.mutate({ requestId: request._id, action: "accept" })
            }
            onReject={() =>
              respondMutation.mutate({ requestId: request._id, action: "reject" })
            }
          />
        ))}
      </ul>
    </section>
  );
};
