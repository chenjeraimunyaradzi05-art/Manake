import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ConnectionRequests, MyConnections, ConnectionSuggestions } from "../components/network";

type Tab = "connections" | "requests" | "suggestions";

const NetworkPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("connections");

  const tabs: { key: Tab; label: string }[] = [
    { key: "connections", label: "My Connections" },
    { key: "requests", label: "Requests" },
    { key: "suggestions", label: "Suggestions" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-primary"
          >
            ← Back to Home
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Network</h1>
          <p className="text-gray-600 mt-2">
            Manage your connections and discover new people
          </p>
        </header>

        {/* Tab Navigation */}
        <nav aria-label="Network sections" className="mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-selected={activeTab === tab.key}
                aria-controls={`panel-${tab.key}`}
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
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={activeTab}
        >
          {activeTab === "connections" && <MyConnections />}
          {activeTab === "requests" && <ConnectionRequests />}
          {activeTab === "suggestions" && <ConnectionSuggestions />}
        </div>
      </div>
    </main>
  );
};

export default NetworkPage;
