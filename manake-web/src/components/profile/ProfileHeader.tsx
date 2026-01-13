import React from "react";
import { Link } from "react-router-dom";
import { UserProfile } from "../../services/profileService";

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
  onConnect?: () => void;
  onMessage?: () => void;
  isConnecting?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  onConnect,
  onMessage,
  isConnecting,
}) => {
  return (
    <header className="relative bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Banner */}
      <div
        className="h-48 bg-gradient-to-r from-primary/20 to-purple-500/20"
        style={
          user.profile?.bannerImage
            ? { backgroundImage: `url(${user.profile.bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
        aria-hidden="true"
      />

      {/* Avatar & Info */}
      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
          <img
            src={user.avatar || "/images/default-avatar.png"}
            alt={`${user.name}'s profile picture`}
            className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
          />
          <div className="flex-1 pt-4 sm:pt-0 sm:pb-2">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {user.profile?.headline && (
              <p className="text-gray-600 mt-1">{user.profile.headline}</p>
            )}
            {user.profile?.location && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <span aria-hidden="true">📍</span>
                {user.profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {user.mentorship?.isMentor && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ Mentor
            </span>
          )}
          {user.milestones?.recoveryDaysCount && user.milestones.recoveryDaysCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              🏆 {user.milestones.recoveryDaysCount} days
            </span>
          )}
          {user.isEmailVerified && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Actions */}
        <nav className="flex gap-3 mt-6" aria-label="Profile actions">
          {isOwnProfile ? (
            <Link
              to="/profile/edit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Edit Profile
            </Link>
          ) : (
            <>
              {onConnect && (
                <button
                  onClick={onConnect}
                  disabled={isConnecting}
                  aria-label={`Connect with ${user.name}`}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isConnecting ? "Sending..." : "Connect"}
                </button>
              )}
              {onMessage && (
                <button
                  onClick={onMessage}
                  aria-label={`Message ${user.name}`}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Message
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export const ProfileHeaderSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="px-6 pb-6">
      <div className="flex items-end gap-4 -mt-16">
        <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white" />
        <div className="flex-1 pb-2 space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded" />
          <div className="h-5 w-64 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-7 w-24 bg-gray-200 rounded-full" />
        <div className="h-7 w-28 bg-gray-200 rounded-full" />
      </div>
      <div className="flex gap-3 mt-6">
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);
