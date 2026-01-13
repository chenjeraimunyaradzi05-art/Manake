import React from "react";
import { useConnections, useRemoveConnection } from "../../hooks/useConnections";
import { Connection, ConnectionUser } from "../../services/connectionService";
import { useAuth } from "../../hooks/useAuth";

interface ConnectionCardViewProps {
  connection: Connection;
  currentUserId: string;
  onRemove: () => void;
  isRemoving: boolean;
}

export const ConnectionCardView: React.FC<ConnectionCardViewProps> = ({
  connection,
  currentUserId,
  onRemove,
  isRemoving,
}) => {
  // Determine the other user in the connection
  const userId = typeof connection.userId === "string" ? connection.userId : connection.userId._id;
  const otherUser = userId === currentUserId
    ? (connection.connectedUserId as ConnectionUser)
    : (connection.userId as ConnectionUser);

  return (
    <li className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <img
          src={otherUser.avatar || "/images/default-avatar.png"}
          alt=""
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-gray-900">{otherUser.name}</p>
          <span className="text-xs text-gray-500 capitalize">
            {connection.connectionType}
          </span>
        </div>
      </div>
      <button
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`Remove connection with ${otherUser.name}`}
        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
      >
        Remove
      </button>
    </li>
  );
};

export const MyConnections: React.FC = () => {
  const { user } = useAuth();
  const { data: connections, isLoading, error, refetch } = useConnections();
  const removeMutation = useRemoveConnection();

  if (isLoading) {
    return (
      <section aria-label="Connections loading">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center" role="alert">
        <p className="text-red-600 mb-2">Failed to load connections</p>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600 mb-2">You don't have any connections yet</p>
        <p className="text-sm text-gray-500">
          Start building your network by exploring suggestions
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Your connections">
      <ul className="space-y-3">
        {connections.map((connection) => (
          <ConnectionCardView
            key={connection._id}
            connection={connection}
            currentUserId={user?._id || ""}
            isRemoving={removeMutation.isPending}
            onRemove={() => removeMutation.mutate(connection._id)}
          />
        ))}
      </ul>
    </section>
  );
};
