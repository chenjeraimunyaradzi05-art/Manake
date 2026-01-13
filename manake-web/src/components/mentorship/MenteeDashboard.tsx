import React from "react";
import { useMyMentorships, useMentorshipStats } from "../../hooks/useMentorship";
import { MentorshipCard } from "./MentorDashboard";
import { Link } from "react-router-dom";

export const MenteeDashboard: React.FC = () => {
  const { data: mentorshipsData, isLoading } = useMyMentorships("mentee");
  const { data: statsData } = useMentorshipStats();

  const mentorships = mentorshipsData?.mentorships || [];
  const stats = statsData?.stats;

  const activeMentorships = mentorships.filter((m) => m.status === "active");
  const pendingMentorships = mentorships.filter((m) => m.status === "pending");
  const completedMentorships = mentorships.filter((m) => m.status === "completed");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (mentorships.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Find Your Mentor
        </h3>
        <p className="text-gray-600 mb-6">
          Connect with experienced mentors who can guide you on your journey.
        </p>
        <Link
          to="/mentorship"
          className="inline-flex px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
        >
          Browse Mentors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.asMentee.active || 0}
              </p>
              <p className="text-sm text-gray-500">Active Mentors</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.asMentee.pending || 0}
              </p>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mentorships.reduce((sum, m) => sum + m.meetings.length, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Meetings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Mentorships */}
      {activeMentorships.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Mentors
          </h2>
          <div className="space-y-4">
            {activeMentorships.map((mentorship) => (
              <MentorshipCard
                key={mentorship._id}
                mentorship={mentorship}
                role="mentee"
              />
            ))}
          </div>
        </section>
      )}

      {/* Pending Requests */}
      {pendingMentorships.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Requests
          </h2>
          <div className="space-y-4">
            {pendingMentorships.map((mentorship) => (
              <div
                key={mentorship._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"
                    style={
                      mentorship.mentor.avatar
                        ? { backgroundImage: `url(${mentorship.mentor.avatar})`, backgroundSize: "cover" }
                        : undefined
                    }
                  >
                    {!mentorship.mentor.avatar && (
                      <span className="text-lg font-bold text-primary">
                        {mentorship.mentor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {mentorship.mentor.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {mentorship.mentor.mentorship?.mentorshipStyle || "Mentor"}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    Awaiting Response
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Sent {new Date(mentorship.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Mentorships */}
      {completedMentorships.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Past Mentorships
          </h2>
          <div className="space-y-4">
            {completedMentorships.map((mentorship) => (
              <MentorshipCard
                key={mentorship._id}
                mentorship={mentorship}
                role="mentee"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
