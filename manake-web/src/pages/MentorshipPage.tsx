import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMentorshipStats } from "../hooks/useMentorship";
import {
  MentorDiscovery,
  MentorDashboard,
  MenteeDashboard,
  BecomeMentor,
} from "../components/mentorship";

type TabKey = "discover" | "my-mentorship" | "become-mentor";

const MentorshipPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: statsData } = useMentorshipStats();
  const stats = statsData?.stats;

  // Cast user for optional extended profile fields
  const extendedUser = user as Record<string, unknown> | null;
  const mentorshipData = extendedUser?.mentorship as Record<string, unknown> | undefined;
  const isMentor = mentorshipData?.isMentor || stats?.isMentor;
  const hasPendingRequests = (stats?.pendingRequests || 0) > 0;

  const [activeTab, setActiveTab] = useState<TabKey>("discover");

  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "discover", label: "Find a Mentor" },
    {
      key: "my-mentorship",
      label: "My Mentorship",
      badge: hasPendingRequests ? stats?.pendingRequests : undefined,
    },
    { key: "become-mentor", label: isMentor ? "Mentor Settings" : "Become a Mentor" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return <MentorDiscovery />;
      case "my-mentorship":
        if (!isAuthenticated) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">Please log in to view your mentorships.</p>
            </div>
          );
        }
        return isMentor ? (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                As a Mentor
              </h2>
              <MentorDashboard />
            </section>
            {(stats?.asMentee.active || 0) + (stats?.asMentee.pending || 0) > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  As a Mentee
                </h2>
                <MenteeDashboard />
              </section>
            )}
          </div>
        ) : (
          <MenteeDashboard />
        );
      case "become-mentor":
        if (!isAuthenticated) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">Please log in to become a mentor.</p>
            </div>
          );
        }
        return <BecomeMentor />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship</h1>
        <p className="text-gray-600">
          Connect with experienced mentors or share your journey by becoming one.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default MentorshipPage;
