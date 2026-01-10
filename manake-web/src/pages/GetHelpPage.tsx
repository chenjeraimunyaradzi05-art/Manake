import { Link } from "react-router-dom";
import { EmergencyWidget } from "../components/EmergencyWidget";
import { ContactForm } from "../components/ContactForm";
import { Heart, Phone, MessageCircle, Shield, Compass } from "lucide-react";

export const GetHelpPage = () => {
  const steps = [
    {
      title: "Reach Out",
      description:
        "Call, WhatsApp, or submit the confidential form. A real human responds.",
      icon: <Phone className="w-6 h-6" />,
    },
    {
      title: "Assessment",
      description:
        "A counselor assesses urgency, safety, and recommends next steps within 24 hours.",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "Plan & Care",
      description:
        "We create a recovery plan with you: residential care, outpatient, or referrals.",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "Life Skills",
      description:
        "Training, mentorship, and family support so you do not fall back into addiction.",
      icon: <Compass className="w-6 h-6" />,
    },
  ];

  const crisisContacts = [
    {
      label: "24/7 Crisis Call",
      value: "+263 77 577 2277",
      href: "tel:+263775772277",
      icon: <Phone className="w-5 h-5" />,
      bg: "bg-red-600",
    },
    {
      label: "WhatsApp Chat",
      value: "+263 77 577 2277",
      href: "https://wa.me/263775772277?text=I%20need%20help%20urgently",
      icon: <MessageCircle className="w-5 h-5" />,
      bg: "bg-green-500",
    },
    {
      label: "Email Support",
      value: "help@manake.org.zw",
      href: "mailto:help@manake.org.zw",
      icon: <Heart className="w-5 h-5" />,
      bg: "bg-primary-600",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-red-600 to-primary-800 text-white py-16">
        <div className="container-custom">
          <p className="text-sm uppercase tracking-wide text-red-100 mb-3">
            You are not alone
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get Help Now</h1>
          <p className="text-lg text-red-100 max-w-2xl">
            Confidential, judgment-free support for youth in Zimbabwe battling
            drug and alcohol addiction. Contact us anytime—day or night.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="tel:+263775772277" className="btn-emergency">
              <Phone size={18} /> Call +263 77 577 2277
            </a>
            <a
              href="https://wa.me/263775772277?text=I%20need%20help%20urgently"
              className="btn-secondary bg-white text-primary-700"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Quick Crisis Cards */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom grid md:grid-cols-3 gap-6">
          {crisisContacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className={`rounded-2xl text-white p-6 shadow-lg flex flex-col gap-2 transition-transform hover:-translate-y-1 ${c.bg}`}
            >
              <div className="flex items-center gap-2 text-sm uppercase tracking-wide opacity-90">
                {c.icon}
                {c.label}
              </div>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="text-sm text-white/90">
                Immediate, confidential support
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-heading">What Happens When You Reach Out</h2>
            <p className="section-subheading mx-auto">
              Simple, human, judgment-free. We focus on safety first, then
              recovery and life skills.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="card-hover p-6 h-full flex flex-col gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold">
                  {idx + 1}
                </div>
                <div className="text-primary-600">{step.icon}</div>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs preview */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="section-heading">Care Tailored to Your Situation</h2>
            <p className="text-lg text-gray-600 mb-6">
              Residential recovery, outpatient support, family counseling, and
              life skills training ensure you stay free from addiction and build
              a stable future.
            </p>
            <ul className="space-y-4 text-gray-700">
              <li className="flex gap-3 items-start">
                <Shield className="text-primary-600 w-5 h-5 mt-1" />
                24/7 supervised residential program (6 months)
              </li>
              <li className="flex gap-3 items-start">
                <Heart className="text-primary-600 w-5 h-5 mt-1" />
                Individual & group counseling with licensed therapists
              </li>
              <li className="flex gap-3 items-start">
                <Compass className="text-primary-600 w-5 h-5 mt-1" />
                Life skills & vocational training to prevent relapse
              </li>
              <li className="flex gap-3 items-start">
                <MessageCircle className="text-primary-600 w-5 h-5 mt-1" />
                Family mediation and reintegration support
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <Link to="/programs" className="btn-primary">
                View Programs
              </Link>
              <Link to="/stories" className="btn-secondary">
                Read Success Stories
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">
              Request Confidential Help
            </h3>
            <p className="text-gray-600 mb-4">
              Share basic details; we respond within 24 hours.
            </p>
            <ContactForm variant="compact" subject="Request for help" />
          </div>
        </div>
      </section>

      {/* Emergency floating */}
      <EmergencyWidget variant="floating" />
    </>
  );
};
