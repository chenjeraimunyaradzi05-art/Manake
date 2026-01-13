import React from "react";
import { Link } from "react-router-dom";
import { useUserActivity } from "../../hooks/useProfile";
import { UserActivity } from "../../services/profileService";

interface ProfileActivityProps {
  userId: string;
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({ userId }) => {
  const { data: activity, isLoading, error } = useUserActivity(userId, 5);

  if (isLoading) {
    return (
      <section className="bg-white rounded-lg shadow-sm p-6 animate-pulse" aria-label="Activity loading">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-3 border-b border-gray-100 last:border-0">
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-lg shadow-sm p-6" role="alert">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-red-600">Failed to load activity</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="activity-heading">
      <h2 id="activity-heading" className="text-xl font-semibold text-gray-900 mb-4">
        Recent Activity
      </h2>

      {!activity || activity.length === 0 ? (
        <p className="text-gray-500">No recent activity</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {activity.map((item) => (
            <ActivityItem key={item._id} activity={item} />
          ))}
        </ul>
      )}

      {activity && activity.length > 0 && (
        <Link
          to={`/profile/${userId}/activity`}
          className="block text-center text-sm text-primary hover:underline mt-4"
        >
          See all activity
        </Link>
      )}
    </section>
  );
};

const ActivityItem: React.FC<{ activity: UserActivity }> = ({ activity }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <li className="py-3">
      <p className="text-gray-700 line-clamp-2">{activity.content}</p>
      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
        <time dateTime={activity.createdAt}>{formatDate(activity.createdAt)}</time>
        <span>•</span>
        <span>{activity.likes} likes</span>
      </div>
    </li>
  );
};
