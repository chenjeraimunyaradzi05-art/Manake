import React from "react";
import { Link } from "react-router-dom";
import { Group } from "../../services/groupService";
import { useJoinGroup, useLeaveGroup } from "../../hooks/useGroups";

interface GroupCardProps {
  group: Group;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const joinMutation = useJoinGroup();
  const leaveMutation = useLeaveGroup();

  const handleJoinLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (group.isMember) {
      leaveMutation.mutate(group._id);
    } else {
      joinMutation.mutate(group._id);
    }
  };

  const isLoading = joinMutation.isPending || leaveMutation.isPending;

  return (
    <Link
      to={`/community/groups/${group._id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0"
          style={
            group.icon
              ? { backgroundImage: `url(${group.icon})`, backgroundSize: "cover" }
              : undefined
          }
        >
          {!group.icon && (
            <span className="text-2xl font-bold text-primary">
              {group.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
            {group.isPrivate && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                Private
              </span>
            )}
          </div>

          {group.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {group.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-500">
              {group.memberCount} member{group.memberCount !== 1 && "s"}
            </span>
            {group.category && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {group.category}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleJoinLeave}
          disabled={isLoading || group.isPrivate && !group.isMember}
          aria-label={group.isMember ? `Leave ${group.name}` : `Join ${group.name}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            group.isMember
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-primary text-white hover:bg-primary/90"
          } disabled:opacity-50`}
        >
          {isLoading ? "..." : group.isMember ? "Leave" : "Join"}
        </button>
      </div>
    </Link>
  );
};

export const GroupCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="h-9 w-16 bg-gray-200 rounded-lg" />
    </div>
  </div>
);
