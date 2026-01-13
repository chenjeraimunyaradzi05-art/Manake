import { Link } from "react-router-dom";
import { StoriesFeed } from "../components/StoriesFeed";
import { ArrowLeft } from "lucide-react";

export const StoriesPage = () => {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <h1 className="text-xl md:text-2xl font-bold mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl">
            Real stories of transformation, hope, and new beginnings. Each
            journey is unique, but they all share one thing: the courage to
            change.
          </p>
        </div>
      </section>

      {/* Stories Feed with Filters */}
      <StoriesFeed showFilters={true} />

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Story Matters Too
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              If you're a Manake graduate and want to share your story to
              inspire others, we'd love to hear from you. Your journey could be
              the hope someone needs today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary">
                Share Your Story
              </Link>
              <Link to="/get-help" className="btn-secondary">
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
