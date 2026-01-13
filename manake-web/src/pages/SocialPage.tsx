import { CommunityFeed } from "../components/social/CommunityFeed";

export const SocialPage = () => {
  return (
    <>
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
        <div className="container-custom">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Social</h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            Share updates and interact within Manake.
          </p>
        </div>
      </section>

      <section className="py-10 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-heading">Community Feed</h2>
          </div>

          <CommunityFeed />
        </div>
      </section>
    </>
  );
};
