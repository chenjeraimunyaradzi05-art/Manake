import React, { useState } from "react";
import {
  useMyMentorships,
  usePendingRequests,
  useAcceptMentorship,
  useDeclineMentorship,
  useEndMentorship,
  useAddMeeting,
} from "../../hooks/useMentorship";
import { Mentorship } from "../../services/mentorshipService";

export const MentorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "completed">("active");

  const { data: mentorshipsData, isLoading } = useMyMentorships("mentor", activeTab);
  const { data: pendingData } = usePendingRequests();

  const pendingCount = pendingData?.requests?.length || 0;
  const mentorships = mentorshipsData?.mentorships || [];

  const tabs = [
    { key: "active", label: "Active Mentees" },
    { key: "pending", label: `Requests${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
    { key: "completed", label: "Completed" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Mentees"
          value={mentorshipsData?.mentorships.filter((m) => m.status === "active").length || 0}
          icon="👥"
        />
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          icon="📨"
          highlight={pendingCount > 0}
        />
        <StatCard
          title="Completed"
          value={mentorshipsData?.mentorships.filter((m) => m.status === "completed").length || 0}
          icon="✅"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <MentorshipCardSkeleton key={i} />
          ))}
        </div>
      ) : mentorships.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {activeTab === "active" && "You don't have any active mentees yet."}
            {activeTab === "pending" && "No pending mentorship requests."}
            {activeTab === "completed" && "No completed mentorships yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "pending"
            ? pendingData?.requests.map((request) => (
                <PendingRequestCard key={request._id} request={request} />
              ))
            : mentorships.map((mentorship) => (
                <MentorshipCard
                  key={mentorship._id}
                  mentorship={mentorship}
                  role="mentor"
                />
              ))}
        </div>
      )}
    </div>
  );
};

// Stat Card
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: string;
  highlight?: boolean;
}> = ({ title, value, icon, highlight }) => (
  <div
    className={`p-4 rounded-lg border ${
      highlight ? "bg-primary/5 border-primary/20" : "bg-white border-gray-200"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  </div>
);

// Pending Request Card
const PendingRequestCard: React.FC<{ request: Mentorship }> = ({ request }) => {
  const acceptMutation = useAcceptMentorship();
  const declineMutation = useDeclineMentorship();

  const handleAccept = () => {
    acceptMutation.mutate(request._id);
  };

  const handleDecline = () => {
    if (confirm("Are you sure you want to decline this request?")) {
      declineMutation.mutate(request._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0"
          style={
            request.mentee.avatar
              ? { backgroundImage: `url(${request.mentee.avatar})`, backgroundSize: "cover" }
              : undefined
          }
        >
          {!request.mentee.avatar && (
            <span className="text-lg font-bold text-primary">
              {request.mentee.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{request.mentee.name}</h3>
          {request.mentee.profile?.headline && (
            <p className="text-sm text-gray-600">{request.mentee.profile.headline}</p>
          )}
          {request.goals.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {request.goals.map((goal) => (
                <span
                  key={goal}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  {goal}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Requested {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            disabled={declineMutation.isPending}
            className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={acceptMutation.isPending}
            className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {acceptMutation.isPending ? "..." : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Mentorship Card
export const MentorshipCard: React.FC<{
  mentorship: Mentorship;
  role: "mentor" | "mentee";
}> = ({ mentorship, role }) => {
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);
  const addMeetingMutation = useAddMeeting();
  const endMutation = useEndMentorship();

  const person = role === "mentor" ? mentorship.mentee : mentorship.mentor;
  const isActive = mentorship.status === "active";

  const handleAddMeeting = (date: string, duration: number, notes: string) => {
    addMeetingMutation.mutate(
      { id: mentorship._id, data: { date, duration, notes } },
      { onSuccess: () => setShowMeetingForm(false) }
    );
  };

  const handleEnd = (rating?: number, review?: string) => {
    endMutation.mutate(
      { id: mentorship._id, data: role === "mentee" ? { rating, review } : undefined },
      { onSuccess: () => setShowEndForm(false) }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0"
          style={
            person.avatar
              ? { backgroundImage: `url(${person.avatar})`, backgroundSize: "cover" }
              : undefined
          }
        >
          {!person.avatar && (
            <span className="text-lg font-bold text-primary">
              {person.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{person.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                mentorship.status === "active"
                  ? "bg-green-100 text-green-700"
                  : mentorship.status === "completed"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {mentorship.status}
            </span>
          </div>

          {mentorship.goals.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {mentorship.goals.map((goal) => (
                <span
                  key={goal}
                  className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                >
                  {goal}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            {mentorship.startDate && (
              <span>Started: {new Date(mentorship.startDate).toLocaleDateString()}</span>
            )}
            <span>{mentorship.meetings.length} meetings</span>
          </div>
        </div>

        {isActive && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowMeetingForm(true)}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Log Meeting
            </button>
            <button
              onClick={() => setShowEndForm(true)}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              End
            </button>
          </div>
        )}

        {mentorship.status === "completed" && mentorship.rating && (
          <div className="text-sm text-gray-500">
            Rating: {"⭐".repeat(mentorship.rating)}
          </div>
        )}
      </div>

      {/* Meeting Form */}
      {showMeetingForm && (
        <MeetingForm
          onSubmit={handleAddMeeting}
          onCancel={() => setShowMeetingForm(false)}
          isLoading={addMeetingMutation.isPending}
        />
      )}

      {/* End Form */}
      {showEndForm && (
        <EndMentorshipForm
          role={role}
          onSubmit={handleEnd}
          onCancel={() => setShowEndForm(false)}
          isLoading={endMutation.isPending}
        />
      )}
    </div>
  );
};

// Meeting Form
const MeetingForm: React.FC<{
  onSubmit: (date: string, duration: number, notes: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ onSubmit, onCancel, isLoading }) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-3">Log a Meeting</h4>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you discuss?"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(date, duration, notes)}
          disabled={isLoading}
          className="px-3 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Meeting"}
        </button>
      </div>
    </div>
  );
};

// End Mentorship Form
const EndMentorshipForm: React.FC<{
  role: "mentor" | "mentee";
  onSubmit: (rating?: number, review?: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ role, onSubmit, onCancel, isLoading }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  return (
    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
      <h4 className="font-medium text-gray-900 mb-3">End Mentorship</h4>

      {role === "mentee" && (
        <>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Rate your mentor</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Review (optional)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
            />
          </div>
        </>
      )}

      <p className="text-sm text-red-600 mb-4">
        Are you sure you want to end this mentorship?
      </p>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(role === "mentee" ? rating : undefined, role === "mentee" ? review : undefined)}
          disabled={isLoading}
          className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? "..." : "End Mentorship"}
        </button>
      </div>
    </div>
  );
};

// Skeleton
const MentorshipCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);
