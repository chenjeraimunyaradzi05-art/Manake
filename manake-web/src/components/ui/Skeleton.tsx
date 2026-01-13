import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  animate?: boolean;
}

/**
 * Base skeleton component with pulse animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width,
  height,
  rounded = "md",
  animate = true,
}) => {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${roundedClasses[rounded]} ${
        animate ? "animate-pulse" : ""
      } ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton for post/story cards
 */
export const PostCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
    {/* Author header */}
    <div className="flex items-center space-x-3">
      <Skeleton className="w-10 h-10" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/6" />
      </div>
    </div>
    
    {/* Content */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
    
    {/* Image placeholder */}
    <Skeleton className="h-48 w-full" rounded="lg" />
    
    {/* Actions */}
    <div className="flex items-center space-x-4 pt-2">
      <Skeleton className="h-8 w-16" rounded="lg" />
      <Skeleton className="h-8 w-16" rounded="lg" />
      <Skeleton className="h-8 w-16" rounded="lg" />
    </div>
  </div>
);

/**
 * Skeleton for profile cards
 */
export const ProfileCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-16 h-16" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <div className="mt-4 flex space-x-2">
      <Skeleton className="h-9 flex-1" rounded="lg" />
      <Skeleton className="h-9 w-9" rounded="lg" />
    </div>
  </div>
);

/**
 * Skeleton for comment items
 */
export const CommentSkeleton: React.FC = () => (
  <div className="flex space-x-3 py-3">
    <Skeleton className="w-8 h-8 flex-shrink-0" rounded="full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

/**
 * Skeleton for list items (connections, groups, etc.)
 */
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-3 py-3 px-4">
    <Skeleton className="w-12 h-12" rounded="full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-8 w-20" rounded="lg" />
  </div>
);

/**
 * Skeleton for message threads
 */
export const MessageThreadSkeleton: React.FC = () => (
  <div className="flex items-center space-x-3 py-3 px-4 border-b border-gray-100 dark:border-gray-700">
    <Skeleton className="w-12 h-12" rounded="full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
);

/**
 * Skeleton for group cards
 */
export const GroupCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
    <Skeleton className="h-24 w-full" rounded="none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-center space-x-2 pt-2">
        <Skeleton className="h-6 w-6" rounded="full" />
        <Skeleton className="h-6 w-6" rounded="full" />
        <Skeleton className="h-6 w-6" rounded="full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for mentor cards
 */
export const MentorCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div className="flex items-start space-x-4">
      <Skeleton className="w-20 h-20" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-6 w-16" rounded="full" />
          <Skeleton className="h-6 w-20" rounded="full" />
          <Skeleton className="h-6 w-14" rounded="full" />
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5 mt-2" />
    </div>
    <div className="mt-4 flex space-x-2">
      <Skeleton className="h-10 flex-1" rounded="lg" />
      <Skeleton className="h-10 w-10" rounded="lg" />
    </div>
  </div>
);

/**
 * Full page skeleton with header and content
 */
export const PageSkeleton: React.FC<{ showHeader?: boolean }> = ({
  showHeader = true,
}) => (
  <div className="animate-pulse space-y-6 p-6">
    {showHeader && (
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" rounded="lg" />
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-48 w-full" rounded="lg" />
      ))}
    </div>
  </div>
);

/**
 * Feed skeleton with multiple post cards
 */
export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

export default Skeleton;
