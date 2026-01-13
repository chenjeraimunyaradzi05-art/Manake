import React from "react";
import { Link } from "react-router-dom";
import { useGroupMembers } from "../../hooks/useGroups";
import { GroupMember } from "../../services/groupService";

interface GroupMembersProps {
  groupId: string;
}

export const GroupMembers: React.FC<GroupMembersProps> = ({ groupId }) => {
  const {
    data,
    isLoading,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGroupMembers(groupId);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse" aria-label="Loading members">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center" role="alert">
        <p className="text-red-600 mb-2">Failed to load members</p>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const allMembers = data?.pages.flatMap((page) => page.members) || [];

  return (
    <div className="space-y-3">
      {allMembers.map((member) => (
        <MemberItem key={member._id} member={member} />
      ))}

      {hasNextPage && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

const MemberItem: React.FC<{ member: GroupMember }> = ({ member }) => {
  const roleBadge = {
    admin: { bg: "bg-amber-100", text: "text-amber-800", label: "Admin" },
    moderator: { bg: "bg-blue-100", text: "text-blue-800", label: "Mod" },
    member: null,
  };

  const badge = roleBadge[member.role];

  return (
    <Link
      to={`/profile/${member._id}`}
      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
    >
      <img
        src={member.avatar || "/images/default-avatar.png"}
        alt=""
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{member.name}</p>
          {badge && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {member.profile?.headline && (
          <p className="text-sm text-gray-500 truncate">{member.profile.headline}</p>
        )}
      </div>
    </Link>
  );
};
