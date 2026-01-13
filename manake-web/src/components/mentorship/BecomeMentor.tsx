import React, { useState } from "react";
import { useBecomeMentor, useUpdateMentorSettings } from "../../hooks/useMentorship";
import { useAuth } from "../../context/AuthContext";

const MENTORSHIP_STYLES = [
  { value: "supportive", label: "Supportive - Warm and encouraging approach" },
  { value: "structured", label: "Structured - Goal-oriented with clear milestones" },
  { value: "peer-based", label: "Peer-Based - Walking alongside as equals" },
  { value: "coaching", label: "Coaching - Asking questions to guide self-discovery" },
];

const SPECIALIZATIONS = [
  "Trauma Recovery",
  "Emotional Healing",
  "Advocacy",
  "Legal Support",
  "Career Guidance",
  "Healthy Relationships",
  "Self-Care & Wellness",
  "Financial Independence",
  "Parenting Support",
  "Returning to Education",
];

const PREFERRED_TIMES = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekends",
  "Flexible",
];

export const BecomeMentor: React.FC = () => {
  const { user } = useAuth();
  const becomeMentorMutation = useBecomeMentor();
  const updateSettingsMutation = useUpdateMentorSettings();

  // Cast user to any for optional extended profile fields from API
  const extendedUser = user as Record<string, unknown> | null;
  const mentorshipData = extendedUser?.mentorship as Record<string, unknown> | undefined;
  const isMentor = Boolean((mentorshipData)?.isMentor);

  // Form state - use safe defaults since extended profile may not be loaded
  const profileData = extendedUser?.profile as Record<string, unknown> | undefined;
  const privacyData = extendedUser?.privacy as Record<string, unknown> | undefined;
  const availabilityData = mentorshipData?.availability as Record<string, unknown> | undefined;

  const [mentorshipStyle, setMentorshipStyle] = useState(
    (mentorshipData?.mentorshipStyle as string) || ""
  );
  const [yearsInRecovery, setYearsInRecovery] = useState(
    (mentorshipData?.yearsInRecovery as number) || 0
  );
  const [specializations, setSpecializations] = useState<string[]>(
    (mentorshipData?.specializations as string[]) || []
  );
  const [hoursPerWeek, setHoursPerWeek] = useState(
    (availabilityData?.hoursPerWeek as number) || 3
  );
  const [preferredTimes, setPreferredTimes] = useState<string[]>(
    (availabilityData?.preferredTimes as string[]) || []
  );
  const [bio, setBio] = useState((profileData?.bio as string) || "");
  const [acceptingRequests, setAcceptingRequests] = useState(
    (privacyData?.allowMentorRequests as boolean) !== false
  );
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);

  const toggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const togglePreferredTime = (time: string) => {
    setPreferredTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      mentorshipStyle,
      yearsInRecovery,
      specializations,
      availability: {
        hoursPerWeek,
        preferredTimes,
      },
      bio,
    };

    if (isMentor) {
      updateSettingsMutation.mutate({
        ...data,
        allowMentorRequests: acceptingRequests,
      });
    } else {
      becomeMentorMutation.mutate(data);
    }
  };

  const isLoading = becomeMentorMutation.isPending || updateSettingsMutation.isPending;
  const isValid =
    mentorshipStyle &&
    yearsInRecovery >= 1 &&
    specializations.length > 0 &&
    (isMentor || acceptedGuidelines);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isMentor ? "Mentor Settings" : "Become a Mentor"}
        </h2>
        <p className="text-gray-600 mb-6">
          {isMentor
            ? "Update your mentor profile and availability."
            : "Share your experience and help others on their recovery journey."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Eligibility Check (for new mentors) */}
          {!isMentor && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-medium text-gray-900 mb-2">
                ✓ Eligibility Requirements
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• At least 1 year in your recovery journey</li>
                <li>• Commitment to supporting others with empathy</li>
                <li>• Availability for regular check-ins</li>
                <li>• Agreement to our mentorship guidelines</li>
              </ul>
            </div>
          )}

          {/* Years in Recovery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years in Recovery *
            </label>
            <select
              value={yearsInRecovery}
              onChange={(e) => setYearsInRecovery(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              <option value="">Select...</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                <option key={year} value={year}>
                  {year}+ years
                </option>
              ))}
            </select>
          </div>

          {/* Mentorship Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mentorship Style *
            </label>
            <div className="space-y-2">
              {MENTORSHIP_STYLES.map((style) => (
                <label
                  key={style.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    mentorshipStyle === style.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="mentorshipStyle"
                    value={style.value}
                    checked={mentorshipStyle === style.value}
                    onChange={(e) => setMentorshipStyle(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      mentorshipStyle === style.value
                        ? "border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {mentorshipStyle === style.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-sm text-gray-900">{style.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specializations * (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    specializations.includes(spec)
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours Available Per Week
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1 hour</span>
              <span className="font-medium text-primary">{hoursPerWeek} hours</span>
              <span>10 hours</span>
            </div>
          </div>

          {/* Preferred Times */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Times
            </label>
            <div className="flex flex-wrap gap-2">
              {PREFERRED_TIMES.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => togglePreferredTime(time)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    preferredTimes.includes(time)
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About You
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a bit about yourself and why you want to be a mentor..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Accepting Requests (for existing mentors) */}
          {isMentor && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="acceptingRequests"
                checked={acceptingRequests}
                onChange={(e) => setAcceptingRequests(e.target.checked)}
                className="w-5 h-5 text-primary rounded"
              />
              <label htmlFor="acceptingRequests" className="text-sm text-gray-700">
                I am currently accepting new mentorship requests
              </label>
            </div>
          )}

          {/* Guidelines Acceptance (for new mentors) */}
          {!isMentor && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Mentorship Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li>• Maintain confidentiality and respect boundaries</li>
                <li>• Be consistent and reliable in your communication</li>
                <li>• Listen with empathy and without judgment</li>
                <li>• Refer to professional help when needed</li>
                <li>• Report any concerns through proper channels</li>
              </ul>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={acceptedGuidelines}
                  onChange={(e) => setAcceptedGuidelines(e.target.checked)}
                  className="w-5 h-5 text-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to follow the mentorship guidelines
                </span>
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Saving..."
              : isMentor
              ? "Update Settings"
              : "Become a Mentor"}
          </button>

          {/* Success Message */}
          {(becomeMentorMutation.isSuccess || updateSettingsMutation.isSuccess) && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center">
              {isMentor ? "Settings updated successfully!" : "🎉 You are now a mentor!"}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
