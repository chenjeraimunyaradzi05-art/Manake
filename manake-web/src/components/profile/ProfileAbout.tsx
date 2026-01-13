import React, { useState } from "react";
import { UserProfile } from "../../services/profileService";

interface ProfileAboutProps {
  user: UserProfile;
  editable?: boolean;
  onSave?: (bio: string, interests: string[]) => void;
  isSaving?: boolean;
}

export const ProfileAbout: React.FC<ProfileAboutProps> = ({
  user,
  editable = false,
  onSave,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user.profile?.bio || "");
  const [interests, setInterests] = useState<string[]>(user.profile?.interests || []);
  const [newInterest, setNewInterest] = useState("");

  const handleSave = () => {
    onSave?.(bio, interests);
    setIsEditing(false);
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="about-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="about-heading" className="text-xl font-semibold text-gray-900">
          About
        </h2>
        {editable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-primary hover:underline"
            aria-label="Edit about section"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
              aria-describedby="bio-counter"
            />
            <p id="bio-counter" className="text-xs text-gray-500 text-right">
              {bio.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-primary/60 hover:text-primary"
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
                onClick={addInterest}
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setBio(user.profile?.bio || "");
                setInterests(user.profile?.interests || []);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 whitespace-pre-wrap">
            {user.profile?.bio || "No bio yet."}
          </p>
          {user.profile?.interests && user.profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {user.profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
