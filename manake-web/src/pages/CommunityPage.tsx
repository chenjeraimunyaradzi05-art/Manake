import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GroupList, GroupFilters } from "../components/groups";
import { useAuth } from "../hooks/useAuth";

type Tab = "discover" | "my-groups";

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const tabs: { key: Tab; label: string }[] = [
    { key: "discover", label: "Discover" },
    { key: "my-groups", label: "My Groups" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">
              Connect with others in groups and communities
            </p>
          </div>
          {user && (
            <Link
              to="/community/groups/create"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Create Group
            </Link>
          )}
        </header>

        {/* Tab Navigation */}
        <nav aria-label="Community sections" className="mb-6">
          <div className="flex border-b border-gray-200">
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
          {activeTab === "discover" && (
            <>
              <GroupFilters
                category={category}
                onCategoryChange={setCategory}
                search={search}
                onSearchChange={setSearch}
              />
              <GroupList
                category={category || undefined}
                search={search || undefined}
                emptyMessage="No groups found. Try a different search or create one!"
              />
            </>
          )}

          {activeTab === "my-groups" && (
            <>
              {user ? (
                <GroupList
                  my
                  emptyMessage="You haven't joined any groups yet. Explore and join some!"
                />
              ) : (
                <div className="p-8 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">
                    Log in to see your groups
                  </p>
                  <Link
                    to="/auth/login"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-block"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default CommunityPage;
