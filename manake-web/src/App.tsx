import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Sidebar } from "./components/Sidebar";
import { RightSidebar } from "./components/RightSidebar";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { PageLoader } from "./components/ui/PageLoader";
import { SkipNavigation } from "./components/ui/SkipNavigation";
import { KeyboardShortcutsHelp } from "./components/ui/KeyboardShortcutsHelp";
import { AuthProvider } from "./context/AuthContext";

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import("./pages/Home").then(m => ({ default: m.HomePage })));
const StoriesPage = lazy(() => import("./pages/StoriesPage").then(m => ({ default: m.StoriesPage })));
const StoryDetail = lazy(() => import("./pages/StoryDetail").then(m => ({ default: m.StoryDetail })));
const DonatePage = lazy(() => import("./pages/DonatePage").then(m => ({ default: m.DonatePage })));
const GetHelpPage = lazy(() => import("./pages/GetHelpPage").then(m => ({ default: m.GetHelpPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));
const ProgramsPage = lazy(() => import("./pages/ProgramsPage").then(m => ({ default: m.ProgramsPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage").then(m => ({ default: m.ThankYouPage })));
const SocialLoginPage = lazy(() => import("./pages/SocialLoginPage").then(m => ({ default: m.SocialLoginPage })));
const SocialCallbackPage = lazy(() => import("./pages/SocialCallbackPage").then(m => ({ default: m.SocialCallbackPage })));
const SocialPage = lazy(() => import("./pages/SocialPage").then(m => ({ default: m.SocialPage })));
const MessagesPage = lazy(() => import("./pages/MessagesPage").then(m => ({ default: m.MessagesPage })));
const CommunityPostDetailPage = lazy(() => import("./pages/CommunityPostDetailPage").then(m => ({ default: m.CommunityPostDetailPage })));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProfileEditPage = lazy(() => import("./pages/ProfileEditPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const GroupDetailPage = lazy(() => import("./pages/GroupDetailPage"));
const CreateGroupPage = lazy(() => import("./pages/CreateGroupPage"));
const MentorshipPage = lazy(() => import("./pages/MentorshipPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage").then(m => ({ default: m.ProductsPage })));
const TeamPage = lazy(() => import("./pages/TeamPage").then(m => ({ default: m.TeamPage })));

// Initialize Stripe only if key is provided
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SkipNavigation />
          <KeyboardShortcutsHelp />
          <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-rose-50 to-amber-50 dark:from-cosmic-950 dark:via-purple-950 dark:to-slate-900">
             
            {/* Top Navigation Header (Global) */}
            <nav className="sticky top-0 z-50 w-full shadow-md" role="navigation" aria-label="Main navigation">
              <Navigation />
            </nav>

            {/* Main Layout Container */}
            <div className="flex flex-grow w-full">
              
              {/* Left Column: Shortcuts / Profile (Desktop) */}
              <aside role="complementary" aria-label="Sidebar navigation">
                <Sidebar />
              </aside>
              
              {/* Main Content Area */}
              <main id="main-content" tabIndex={-1} role="main" aria-label="Main content" className="flex-1 min-h-screen transition-all duration-300 pt-6 px-0">
                <Suspense fallback={<PageLoader message="Loading page..." />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/stories" element={<StoriesPage />} />
                    <Route path="/story/:id" element={<StoryDetail />} />
                    <Route path="/donate" element={<DonatePage />} />
                    <Route path="/social" element={<SocialPage />} />
                    <Route path="/social/post/:id" element={<CommunityPostDetailPage />} />
                    <Route path="/network" element={<NetworkPage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                    <Route path="/profile/edit" element={<ProfileEditPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/community/groups/:id" element={<GroupDetailPage />} />
                    <Route path="/community/groups/create" element={<CreateGroupPage />} />
                    <Route path="/mentorship" element={<MentorshipPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/auth/login" element={<SocialLoginPage />} />
                    <Route path="/auth/:provider/callback" element={<SocialCallbackPage />} />
                    <Route path="/thank-you" element={<ThankYouPage />} />
                    <Route path="/get-help" element={<GetHelpPage />} />
                    <Route path="/programs" element={<ProgramsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
                  
                {/* Footer for Mobile (since Right Sidebar hidden) */}
                <div className="lg:hidden mt-8 pb-20">
                  <Footer />
                </div>
              </main>

              {/* Right Column: Sidebar (Desktop) */}
              <aside className="hidden lg:block w-72 shrink-0" role="complementary" aria-label="Additional content">
                <div className="sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
                  <RightSidebar />
                </div>
              </aside>
              
            </div>
          </div>
        </Router>
      </Elements>
    </AuthProvider>
  );
}

export default App;
