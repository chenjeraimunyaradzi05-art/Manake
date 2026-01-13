import { CommunityFeed } from "../components/social/CommunityFeed";
import { Users, TrendingUp } from "lucide-react";

const TrendingTopic = ({ topic, count }: { topic: string; count: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-md transition-colors cursor-pointer">
    <span className="text-sm font-medium text-gray-700">{topic}</span>
    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      {count}
    </span>
  </div>
);

const SuggestedUser = ({
  name,
  role,
  img,
}: {
  name: string;
  role: string;
  img: string;
}) => (
  <div className="flex items-center gap-3 py-2">
    <img
      src={img}
      alt={name}
      className="w-10 h-10 rounded-full object-cover border border-gray-200"
    />
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
      <p className="text-xs text-gray-500 truncate">{role}</p>
    </div>
    <button className="text-primary-600 hover:bg-primary-50 p-1.5 rounded-full transition-colors text-xs font-medium">
      Connect
    </button>
  </div>
);

export const SocialPage = () => {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-800 to-indigo-900 text-white pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Manake Community
              </h1>
              <p className="text-lg text-primary-100 max-w-2xl leading-relaxed">
                Connect with peers, share your journey, and find support in a
                safe space. Together we are stronger. 🇿🇼
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Navigation / Profile Summary (Optional, hidden on mobile for now) */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  <TrendingUp size={18} className="text-primary-600" /> Trending
                  in Zimbabwe
                </h3>
                <div className="space-y-1">
                  <TrendingTopic topic="#Recovery" count="1.2k" />
                  <TrendingTopic topic="#MentalHealth" count="856" />
                  <TrendingTopic topic="#ManakeFamily" count="543" />
                  <TrendingTopic topic="#Harare" count="432" />
                  <TrendingTopic topic="#SoberLife" count="321" />
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-6">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-1 mb-6">
                <h2 className="sr-only">Community Feed</h2>
                <CommunityFeed />
              </div>
            </div>

            {/* Right Sidebar - Suggestions */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  <Users size={18} className="text-primary-600" /> Member
                  Spotlight
                </h3>
                <div className="space-y-2">
                  <SuggestedUser
                    name="Tapiwa M."
                    role="Alumni • 2 years sober"
                    img="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=150&h=150&fit=crop"
                  />
                  <SuggestedUser
                    name="Dr. Mutasa"
                    role="Counselor"
                    img="https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=150&h=150&fit=crop"
                  />
                  <SuggestedUser
                    name="Grace K."
                    role="Peer Mentor"
                    img="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"
                  />
                </div>
                <button className="w-full mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all members
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
