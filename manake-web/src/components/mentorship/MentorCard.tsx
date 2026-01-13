import React, { useState } from "react";
import { Mentor } from "../../services/mentorshipService";
import { useRequestMentorship } from "../../hooks/useMentorship";

interface MentorCardProps {
  mentor: Mentor;
  onViewDetails?: (mentor: Mentor) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onViewDetails }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const requestMutation = useRequestMentorship();

  const handleRequestMentorship = () => {
    setShowRequestModal(true);
  };

  const renderStars = (rating?: number) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= roundedRating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4"
            style={
              mentor.avatar
                ? { backgroundImage: `url(${mentor.avatar})`, backgroundSize: "cover" }
                : undefined
            }
          >
            {!mentor.avatar && (
              <span className="text-2xl font-bold text-primary">
                {mentor.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name & Headline */}
          <h3 className="font-semibold text-gray-900 text-lg">{mentor.name}</h3>
          {mentor.profile?.headline && (
            <p className="text-sm text-gray-600 mt-1">{mentor.profile.headline}</p>
          )}

          {/* Mentorship Style */}
          {mentor.mentorship?.mentorshipStyle && (
            <span className="mt-2 text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">
              {mentor.mentorship.mentorshipStyle}
            </span>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mt-3">
            {renderStars(mentor.mentorship?.averageRating)}
            {mentor.mentorship?.averageRating && (
              <span className="text-sm text-gray-500 ml-1">
                ({mentor.mentorship.averageRating.toFixed(1)})
              </span>
            )}
          </div>

          {/* Years in Recovery */}
          {mentor.mentorship?.yearsInRecovery && (
            <p className="text-sm text-gray-500 mt-2">
              {mentor.mentorship.yearsInRecovery}+ years in recovery
            </p>
          )}

          {/* Specializations */}
          {mentor.mentorship?.specializations && mentor.mentorship.specializations.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-3">
              {mentor.mentorship.specializations.slice(0, 3).map((spec) => (
                <span
                  key={spec}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  {spec}
                </span>
              ))}
              {mentor.mentorship.specializations.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{mentor.mentorship.specializations.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 w-full">
            <button
              onClick={() => onViewDetails?.(mentor)}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={handleRequestMentorship}
              className="flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Request
            </button>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <RequestMentorshipModal
          mentor={mentor}
          onClose={() => setShowRequestModal(false)}
          onSubmit={(goals, message) => {
            requestMutation.mutate(
              { mentorId: mentor._id, goals, message },
              {
                onSuccess: () => setShowRequestModal(false),
              }
            );
          }}
          isLoading={requestMutation.isPending}
        />
      )}
    </>
  );
};

// Request Mentorship Modal
interface RequestModalProps {
  mentor: Mentor;
  onClose: () => void;
  onSubmit: (goals: string[], message: string) => void;
  isLoading: boolean;
}

const RequestMentorshipModal: React.FC<RequestModalProps> = ({
  mentor,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [goals, setGoals] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [customGoal, setCustomGoal] = useState("");

  const commonGoals = [
    "Recovery support",
    "Emotional healing",
    "Career guidance",
    "Building healthy relationships",
    "Self-care practices",
    "Advocacy skills",
  ];

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !goals.includes(customGoal.trim())) {
      setGoals([...goals, customGoal.trim()]);
      setCustomGoal("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Request Mentorship</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            You're requesting mentorship from <strong>{mentor.name}</strong>
          </p>

          {/* Goals Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are your goals? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {commonGoals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    goals.includes(goal)
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>

            {/* Custom Goal */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Add a custom goal..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyPress={(e) => e.key === "Enter" && addCustomGoal()}
              />
              <button
                type="button"
                onClick={addCustomGoal}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>

            {/* Selected Goals */}
            {goals.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {goals.map((goal) => (
                  <span
                    key={goal}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                  >
                    {goal}
                    <button
                      onClick={() => toggleGoal(goal)}
                      className="hover:text-primary/70"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Personal Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and share why you'd like this person as your mentor..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(goals, message)}
              disabled={isLoading || goals.length === 0}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MentorCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-gray-200 mb-4" />
      <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="flex gap-2 w-full mt-4">
        <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);
