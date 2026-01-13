import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?._id ?? undefined);
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");

  // Mentorship fields
  const [isMentor, setIsMentor] = useState(false);
  const [yearsInRecovery, setYearsInRecovery] = useState<number>(0);
  const [mentorshipStyle, setMentorshipStyle] = useState("");

  // Privacy fields
  const [visibility, setVisibility] = useState<"public" | "connections-only" | "private">("public");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setHeadline(profile.profile?.headline || "");
      setBio(profile.profile?.bio || "");
      setLocation(profile.profile?.location || "");
      setInterests(profile.profile?.interests || []);
      setIsMentor(profile.mentorship?.isMentor || false);
      setYearsInRecovery(profile.mentorship?.yearsInRecovery || 0);
      setMentorshipStyle(profile.mentorship?.mentorshipStyle || "");
      setVisibility(profile.privacy?.visibility || "public");
    }
  }, [profile]);

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateProfile.mutateAsync({
      name,
      profile: {
        headline,
        bio,
        location,
        interests,
      },
      mentorship: {
        isMentor,
        yearsInRecovery: isMentor ? yearsInRecovery : undefined,
        mentorshipStyle: isMentor ? mentorshipStyle : undefined,
      },
      privacy: {
        visibility,
      },
    });

    navigate(`/profile/${user?._id}`);
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">Please log in to edit your profile</p>
            <Link to="/auth/login" className="text-primary hover:underline mt-4 inline-block">
              Log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link to={`/profile/${user._id}`} className="text-sm text-gray-500 hover:text-primary">
            ← Back to Profile
          </Link>
        </nav>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h1>

          {/* Basic Info */}
          <section className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                Headline
              </label>
              <input
                id="headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Recovery Advocate | Peer Support Specialist"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Harare, Zimbabwe"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 text-right mt-1">{bio.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-2 hover:text-primary/80"
                      aria-label={`Remove ${interest}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  placeholder="Add an interest"
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </section>

          {/* Mentorship */}
          <section className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Mentorship</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isMentor}
                onChange={(e) => setIsMentor(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-gray-700">I'm available to mentor others</span>
            </label>

            {isMentor && (
              <>
                <div>
                  <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-1">
                    Years in Recovery
                  </label>
                  <input
                    id="years"
                    type="number"
                    min={0}
                    value={yearsInRecovery}
                    onChange={(e) => setYearsInRecovery(parseInt(e.target.value) || 0)}
                    className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
                    Mentorship Style
                  </label>
                  <input
                    id="style"
                    type="text"
                    value={mentorshipStyle}
                    onChange={(e) => setMentorshipStyle(e.target.value)}
                    placeholder="e.g., Supportive, structured, goal-oriented"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </>
            )}
          </section>

          {/* Privacy */}
          <section className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Privacy</h2>

            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Visibility
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="public">Public - Anyone can view</option>
                <option value="connections-only">Connections Only</option>
                <option value="private">Private - Only you</option>
              </select>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </button>
            <Link
              to={`/profile/${user._id}`}
              className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancel
            </Link>
          </div>

          {updateProfile.isError && (
            <p className="mt-4 text-red-600 text-sm" role="alert">
              Failed to save changes. Please try again.
            </p>
          )}
        </form>
      </div>
    </main>
  );
};

export default ProfileEditPage;
