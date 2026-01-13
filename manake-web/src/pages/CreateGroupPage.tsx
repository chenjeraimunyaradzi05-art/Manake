import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreateGroup } from "../hooks/useGroups";
import { useAuth } from "../hooks/useAuth";

const CATEGORIES = [
  "Recovery",
  "Support",
  "Wellness",
  "Social",
  "Professional",
  "Other",
];

const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createGroup = useCreateGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const group = await createGroup.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      category: category || undefined,
      isPrivate,
    });

    navigate(`/community/groups/${group._id}`);
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">Please log in to create a group</p>
            <Link
              to="/auth/login"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-block"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link to="/community" className="text-sm text-gray-500 hover:text-primary">
            ← Back to Community
          </Link>
        </nav>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Create a Group</h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={200}
                placeholder="e.g., Recovery Warriors"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="What is this group about?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {description.length}/2000
              </p>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium text-gray-700">Private Group</span>
                  <p className="text-sm text-gray-500">
                    Only approved members can see posts and member list
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t mt-8">
            <button
              type="submit"
              disabled={!name.trim() || createGroup.isPending}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              {createGroup.isPending ? "Creating..." : "Create Group"}
            </button>
            <Link
              to="/community"
              className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancel
            </Link>
          </div>

          {createGroup.isError && (
            <p className="mt-4 text-red-600 text-sm" role="alert">
              Failed to create group. Please try again.
            </p>
          )}
        </form>
      </div>
    </main>
  );
};

export default CreateGroupPage;
