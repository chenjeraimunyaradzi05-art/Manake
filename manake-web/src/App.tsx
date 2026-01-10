import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/Home";
import { StoriesPage } from "./pages/StoriesPage";
import { StoryDetail } from "./pages/StoryDetail";
import { DonatePage } from "./pages/DonatePage";
import { GetHelpPage } from "./pages/GetHelpPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { SocialLoginPage } from "./pages/SocialLoginPage";
import { SocialCallbackPage } from "./pages/SocialCallbackPage";
import { AuthProvider } from "./context/AuthContext";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navigation />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/story/:id" element={<StoryDetail />} />
                <Route path="/donate" element={<DonatePage />} />
                <Route path="/auth/login" element={<SocialLoginPage />} />
                <Route
                  path="/auth/:provider/callback"
                  element={<SocialCallbackPage />}
                />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="/get-help" element={<GetHelpPage />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </Elements>
    </AuthProvider>
  );
}

export default App;
