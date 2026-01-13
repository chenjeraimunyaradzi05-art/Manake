import React from "react";
import { UserProfile } from "../../services/profileService";

interface ProfileExperienceProps {
  user: UserProfile;
}

export const ProfileExperience: React.FC<ProfileExperienceProps> = ({ user }) => {
  if (!user.mentorship?.isMentor) return null;

  const { mentorship } = user;

  return (
    <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="experience-heading">
      <h2 id="experience-heading" className="text-xl font-semibold text-gray-900 mb-4">
        Mentorship Experience
      </h2>

      <dl className="space-y-4">
        {mentorship.yearsInRecovery != null && (
          <div>
            <dt className="text-sm text-gray-500">Years in Recovery</dt>
            <dd className="text-lg font-medium text-gray-900">
              {mentorship.yearsInRecovery} years
            </dd>
          </div>
        )}

        {mentorship.specializations && mentorship.specializations.length > 0 && (
          <div>
            <dt className="text-sm text-gray-500 mb-2">Specializations</dt>
            <dd className="flex flex-wrap gap-2">
              {mentorship.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
            </dd>
          </div>
        )}

        {mentorship.mentorshipStyle && (
          <div>
            <dt className="text-sm text-gray-500">Mentorship Style</dt>
            <dd className="text-gray-900">{mentorship.mentorshipStyle}</dd>
          </div>
        )}

        {mentorship.averageRating != null && (
          <div>
            <dt className="text-sm text-gray-500">Rating</dt>
            <dd className="flex items-center gap-1">
              <span className="text-lg font-medium text-gray-900">
                {mentorship.averageRating.toFixed(1)}
              </span>
              <span className="text-amber-500" aria-hidden="true">★</span>
              <span className="sr-only">out of 5 stars</span>
            </dd>
          </div>
        )}

        {mentorship.availability && (
          <div>
            <dt className="text-sm text-gray-500">Availability</dt>
            <dd className="text-gray-900">
              {mentorship.availability.hoursPerWeek} hours/week
              {mentorship.availability.preferredTimes &&
                mentorship.availability.preferredTimes.length > 0 && (
                  <span className="text-sm text-gray-500 block">
                    Preferred: {mentorship.availability.preferredTimes.join(", ")}
                  </span>
                )}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
};
