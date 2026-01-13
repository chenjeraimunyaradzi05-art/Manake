import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useSendConnectionRequest } from "../hooks/useConnections";
import {
  ProfileHeader,
  ProfileHeaderSkeleton,
  ProfileAbout,
  ProfileActivity,
  ProfileStats,
  MutualConnections,
  ProfileExperience,
} from "../components/profile";

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading, error, refetch } = useProfile(id);
  const sendRequest = useSendConnectionRequest();

  const isOwnProfile = currentUser?._id === id;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <ProfileHeaderSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            </div>
            <aside className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-6 w-20 bg-gray-200 rounded mb-4" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">
              The user you're looking for doesn't exist or their profile is private.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Go Home
              </Link>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Handle private profiles
  if (profile.isPrivate) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <img
              src={profile.avatar || "/images/default-avatar.png"}
              alt=""
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h1>
            <p className="text-gray-600">This profile is private</p>
          </div>
        </div>
      </main>
    );
  }

  // Handle connections-only profiles
  if (profile.isConnectionsOnly) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <img
              src={profile.avatar || "/images/default-avatar.png"}
              alt=""
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h1>
            {profile.profile?.headline && (
              <p className="text-gray-600 mb-4">{profile.profile.headline}</p>
            )}
            <p className="text-gray-500 mb-6">
              Connect with {profile.name} to see their full profile
            </p>
            <button
              onClick={() => sendRequest.mutate({ targetUserId: profile._id })}
              disabled={sendRequest.isPending}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {sendRequest.isPending ? "Sending..." : "Send Connection Request"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-primary">
            ← Back to Home
          </Link>
        </nav>

        <ProfileHeader
          user={profile}
          isOwnProfile={isOwnProfile}
          onConnect={
            !isOwnProfile
              ? () => sendRequest.mutate({ targetUserId: profile._id })
              : undefined
          }
          onMessage={!isOwnProfile ? () => {/* navigate to messages */} : undefined}
          isConnecting={sendRequest.isPending}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileAbout user={profile} editable={isOwnProfile} />
            <ProfileActivity userId={profile._id} />
            {profile.mentorship?.isMentor && <ProfileExperience user={profile} />}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <ProfileStats userId={profile._id} />
            <MutualConnections userId={profile._id} currentUserId={currentUser?._id ?? undefined} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
