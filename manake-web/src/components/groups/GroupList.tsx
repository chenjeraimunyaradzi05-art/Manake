import React from "react";
import { useGroups } from "../../hooks/useGroups";
import { GroupCard, GroupCardSkeleton } from "./GroupCard";

interface GroupListProps {
  category?: string;
  search?: string;
  my?: boolean;
  emptyMessage?: string;
}

export const GroupList: React.FC<GroupListProps> = ({
  category,
  search,
  my,
  emptyMessage = "No groups found",
}) => {
  const {
    data,
    isLoading,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGroups({ category, search, my });

  if (isLoading) {
    return (
      <div className="space-y-4" aria-label="Loading groups">
        {[1, 2, 3, 4].map((i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center" role="alert">
        <p className="text-red-600 mb-2">Failed to load groups</p>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const allGroups = data?.pages.flatMap((page) => page.groups) || [];

  if (allGroups.length === 0) {
    return (
      <div className="p-8 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allGroups.map((group) => (
        <GroupCard key={group._id} group={group} />
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

// Category filter component
const CATEGORIES = [
  "All",
  "Recovery",
  "Support",
  "Wellness",
  "Social",
  "Professional",
  "Other",
];

interface GroupFiltersProps {
  category: string;
  onCategoryChange: (category: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const GroupFilters: React.FC<GroupFiltersProps> = ({
  category,
  onCategoryChange,
  search,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="group-search" className="sr-only">
          Search groups
        </label>
        <input
          id="group-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search groups..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat === "All" ? "" : cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              (cat === "All" && !category) || category === cat
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
