import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGroup } from "../hooks/useGroups";
import {
  GroupHeader,
  GroupHeaderSkeleton,
  GroupFeed,
  GroupMembers,
} from "../components/groups";

type Tab = "feed" | "members" | "about";

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: group, isLoading, error, refetch } = useGroup(id);
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  const tabs: { key: Tab; label: string }[] = [
    { key: "feed", label: "Feed" },
    { key: "members", label: "Members" },
    { key: "about", label: "About" },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <GroupHeaderSkeleton />
        </div>
      </main>
    );
  }

  if (error || !group) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h1>
            <p className="text-gray-600 mb-6">
              This group doesn't exist or has been deleted.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/community"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Browse Groups
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

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link to="/community" className="text-sm text-gray-500 hover:text-primary">
            ← Back to Community
          </Link>
        </nav>

        <GroupHeader group={group} />

        {/* Tab Navigation */}
        <nav aria-label="Group sections" className="mt-6 mb-4">
          <div className="flex border-b border-gray-200 bg-white rounded-t-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-selected={activeTab === tab.key}
                role="tab"
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Panels */}
        <div role="tabpanel">
          {activeTab === "feed" && (
            <GroupFeed groupId={group._id} isMember={group.isMember || false} />
          )}
          {activeTab === "members" && <GroupMembers groupId={group._id} />}
          {activeTab === "about" && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {group.description || "No description provided."}
              </p>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Details</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Members</dt>
                    <dd className="font-medium text-gray-900">{group.memberCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Privacy</dt>
                    <dd className="font-medium text-gray-900">
                      {group.isPrivate ? "Private" : "Public"}
                    </dd>
                  </div>
                  {group.category && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Category</dt>
                      <dd className="font-medium text-gray-900">{group.category}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default GroupDetailPage;
