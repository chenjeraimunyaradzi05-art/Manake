import React from "react";
import { Link } from "react-router-dom";
import { Group } from "../../services/groupService";
import { useJoinGroup, useLeaveGroup } from "../../hooks/useGroups";

interface GroupHeaderProps {
  group: Group;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ group }) => {
  const joinMutation = useJoinGroup();
  const leaveMutation = useLeaveGroup();

  const handleJoinLeave = () => {
    if (group.isMember) {
      leaveMutation.mutate(group._id);
    } else {
      joinMutation.mutate(group._id);
    }
  };

  const isLoading = joinMutation.isPending || leaveMutation.isPending;

  return (
    <header className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Banner */}
      <div
        className="h-40 bg-gradient-to-r from-primary/30 to-purple-500/30"
        style={
          group.icon
            ? { backgroundImage: `url(${group.icon})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="w-20 h-20 -mt-16 rounded-xl bg-white shadow-md flex items-center justify-center border-4 border-white"
            style={
              group.icon
                ? { backgroundImage: `url(${group.icon})`, backgroundSize: "cover" }
                : { background: "linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)" }
            }
          >
            {!group.icon && (
              <span className="text-3xl font-bold text-white">
                {group.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              {group.isPrivate && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  🔒 Private
                </span>
              )}
              {group.category && (
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {group.category}
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              {group.memberCount} member{group.memberCount !== 1 && "s"}
            </p>
          </div>

          <div className="flex gap-3">
            {group.isAdmin && (
              <Link
                to={`/community/groups/${group._id}/settings`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Settings
              </Link>
            )}
            <button
              onClick={handleJoinLeave}
              disabled={isLoading || (group.isPrivate && !group.isMember)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                group.isMember
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-primary text-white hover:bg-primary/90"
              } disabled:opacity-50`}
            >
              {isLoading
                ? "..."
                : group.isMember
                ? "Leave Group"
                : group.isPrivate
                ? "Request to Join"
                : "Join Group"}
            </button>
          </div>
        </div>

        {group.description && (
          <p className="text-gray-700 mt-4">{group.description}</p>
        )}
      </div>
    </header>
  );
};

export const GroupHeaderSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-200" />
    <div className="p-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 -mt-16 rounded-xl bg-gray-300 border-4 border-white" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);
