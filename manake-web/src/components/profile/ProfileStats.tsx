import React from "react";
import { useUserStats, useMutualConnections } from "../../hooks/useProfile";

interface ProfileStatsProps {
  userId: string;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ userId }) => {
  const { data: stats, isLoading } = useUserStats(userId);

  if (isLoading) {
    return (
      <section className="bg-white rounded-lg shadow-sm p-6 animate-pulse" aria-label="Stats loading">
        <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="text-lg font-semibold text-gray-900 mb-4">
        Stats
      </h2>
      <dl className="space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Connections</dt>
          <dd className="text-xl font-bold text-gray-900">{stats?.connections ?? 0}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Posts</dt>
          <dd className="text-xl font-bold text-gray-900">{stats?.posts ?? 0}</dd>
        </div>
      </dl>
    </section>
  );
};

interface MutualConnectionsProps {
  userId: string;
  currentUserId?: string;
}

export const MutualConnections: React.FC<MutualConnectionsProps> = ({
  userId,
  currentUserId,
}) => {
  const { data, isLoading } = useMutualConnections(
    currentUserId && currentUserId !== userId ? userId : undefined
  );

  if (!currentUserId || currentUserId === userId) return null;

  if (isLoading) {
    return (
      <section className="bg-white rounded-lg shadow-sm p-6 mt-4 animate-pulse" aria-label="Mutual connections loading">
        <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.mutuals.length === 0) return null;

  return (
    <section className="bg-white rounded-lg shadow-sm p-6 mt-4" aria-labelledby="mutual-heading">
      <h2 id="mutual-heading" className="text-lg font-semibold text-gray-900 mb-3">
        {data.totalCount} Mutual Connection{data.totalCount !== 1 && "s"}
      </h2>
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {data.mutuals.slice(0, 5).map((mutual) => (
            <img
              key={mutual._id}
              src={mutual.avatar || "/images/default-avatar.png"}
              alt={mutual.name}
              title={mutual.name}
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>
        {data.totalCount > 5 && (
          <span className="ml-2 text-sm text-gray-500">
            +{data.totalCount - 5} more
          </span>
        )}
      </div>
    </section>
  );
};
