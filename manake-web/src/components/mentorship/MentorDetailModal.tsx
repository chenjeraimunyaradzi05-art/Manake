import React, { useState } from "react";
import { useMentor, useRequestMentorship } from "../../hooks/useMentorship";

interface MentorDetailModalProps {
  mentorId: string;
  onClose: () => void;
}

export const MentorDetailModal: React.FC<MentorDetailModalProps> = ({
  mentorId,
  onClose,
}) => {
  const { data, isLoading } = useMentor(mentorId);
  const requestMutation = useRequestMentorship();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const mentor = data?.mentor;
  const reviews = data?.reviews || [];
  const activeMenteeCount = data?.activeMenteeCount || 0;

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

  const handleRequest = () => {
    requestMutation.mutate(
      { mentorId, goals, message },
      {
        onSuccess: () => {
          setShowRequestForm(false);
          onClose();
        },
      }
    );
  };

  const commonGoals = [
    "Recovery support",
    "Emotional healing",
    "Career guidance",
    "Building healthy relationships",
    "Self-care practices",
  ];

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-4">Loading mentor details...</p>
          </div>
        ) : mentor ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0"
                  style={
                    mentor.avatar
                      ? { backgroundImage: `url(${mentor.avatar})`, backgroundSize: "cover" }
                      : undefined
                  }
                >
                  {!mentor.avatar && (
                    <span className="text-3xl font-bold text-primary">
                      {mentor.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
                      {mentor.profile?.headline && (
                        <p className="text-gray-600">{mentor.profile.headline}</p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-2">
                    {renderStars(mentor.mentorship?.averageRating)}
                    {mentor.mentorship?.averageRating && (
                      <span className="text-sm text-gray-500">
                        ({mentor.mentorship.averageRating.toFixed(1)})
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      · {reviews.length} reviews
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 mt-3 text-sm">
                    {mentor.mentorship?.yearsInRecovery && (
                      <span className="text-gray-600">
                        <strong>{mentor.mentorship.yearsInRecovery}</strong> years in recovery
                      </span>
                    )}
                    <span className="text-gray-600">
                      <strong>{activeMenteeCount}</strong> active mentees
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Mentorship Style */}
              {mentor.mentorship?.mentorshipStyle && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Mentorship Style</h3>
                  <p className="text-gray-900">{mentor.mentorship.mentorshipStyle}</p>
                </div>
              )}

              {/* Bio */}
              {mentor.profile?.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">About</h3>
                  <p className="text-gray-700">{mentor.profile.bio}</p>
                </div>
              )}

              {/* Specializations */}
              {mentor.mentorship?.specializations && mentor.mentorship.specializations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.mentorship.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {mentor.mentorship?.availability && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Availability</h3>
                  <p className="text-gray-700">
                    {mentor.mentorship.availability.hoursPerWeek} hours/week
                    {(mentor.mentorship.availability.preferredTimes?.length ?? 0) > 0 && (
                      <span className="text-gray-500">
                        {" · "}
                        {mentor.mentorship.availability.preferredTimes?.join(", ")}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Reviews */}
              {reviews.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                            style={
                              review.mentee.avatar
                                ? { backgroundImage: `url(${review.mentee.avatar})`, backgroundSize: "cover" }
                                : undefined
                            }
                          >
                            {!review.mentee.avatar && (
                              <span className="text-xs font-medium text-gray-600">
                                {review.mentee.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {review.mentee.name}
                            </p>
                            <div className="flex text-sm">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review && (
                          <p className="text-sm text-gray-700">{review.review}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Form */}
              {showRequestForm && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Request Mentorship
                  </h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select your goals
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
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Introduce yourself..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRequestForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequest}
                      disabled={requestMutation.isPending || goals.length === 0}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {requestMutation.isPending ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!showRequestForm && (
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                >
                  Request Mentorship
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Mentor not found</p>
          </div>
        )}
      </div>
    </div>
  );
};
