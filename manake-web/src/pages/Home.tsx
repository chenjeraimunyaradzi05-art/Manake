import { Link } from "react-router-dom";
import {
  Heart,
  ArrowRight,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Phone,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { StoriesFeed } from "../components/StoriesFeed";
import { DonationForm } from "../components/DonationForm";
import { EmergencyWidget } from "../components/EmergencyWidget";
import { StatCard, StatsGrid } from "../components/StatCard";
import { TestimonialCard } from "../components/TestimonialCard";

export const HomePage = () => {
  const impactStats = [
    {
      icon: <Users size={32} />,
      number: "500+",
      label: "Youth Helped",
      description: "Lives transformed",
    },
    {
      icon: <TrendingUp size={32} />,
      number: "85%",
      label: "Success Rate",
      description: "Stay sober after 1 year",
    },
    {
      icon: <Heart size={32} />,
      number: "1,000+",
      label: "Donors",
      description: "Supporting our mission",
    },
    {
      icon: <Award size={32} />,
      number: "5",
      label: "Years",
      description: "Serving Zimbabwe",
    },
  ];

  const testimonials = [
    {
      quote:
        "Manake saved my son's life. The team truly cares about each individual and their family. We are forever grateful.",
      author: "Mrs. Moyo",
      role: "Parent of Graduate",
      rating: 5,
    },
    {
      quote:
        "I thought my life was over at 19. Manake showed me there's always a way back. Now I'm running my own business!",
      author: "Tendai M.",
      role: "Graduate, Class of 2024",
      rating: 5,
    },
    {
      quote:
        "The life skills training was a game-changer. I didn't just recover, I discovered my purpose.",
      author: "Chipo N.",
      role: "Graduate & Mentor",
      rating: 5,
    },
  ];

  return (
    <>
      {/* Hero Section - Cosmic Royal Theme */}
      <section
        className="relative overflow-hidden min-h-[90vh] flex items-center"
        style={{
          background:
            "linear-gradient(135deg, #1a0f2e 0%, #2d1b69 50%, #6b4c9a 100%)",
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Sparkle effects */}
          <div
            className="absolute top-20 left-10 w-2 h-2 bg-gold-500 rounded-full animate-sparkle"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-40 right-20 w-3 h-3 bg-gold-400 rounded-full animate-sparkle"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-40 left-1/4 w-2 h-2 bg-accent-400 rounded-full animate-sparkle"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/3 right-1/3 w-2 h-2 bg-gold-500 rounded-full animate-sparkle"
            style={{ animationDelay: "1.5s" }}
          />

          {/* Gradient orbs */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-accent-500/30 to-transparent rounded-full blur-3xl animate-celestial-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gold-500/20 to-transparent rounded-full blur-3xl animate-celestial-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container-custom relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500/20 to-accent-500/20 backdrop-blur-sm text-gold-300 text-sm font-medium px-6 py-3 rounded-full mb-6 border border-gold-500/30">
                <Sparkles size={16} className="text-gold-400" />
                Zimbabwe's Premier Youth Rehabilitation Center
              </span>

              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 leading-tight text-white">
                Recovery is{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  Possible.
                </span>
                <br />
                Hope is{" "}
                <span className="bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
                  Powerful.
                </span>
              </h1>

              <p className="text-xl text-primary-200 mb-8 max-w-xl mx-auto lg:mx-0">
                Manake Rehabilitation Center empowers youth in Zimbabwe to
                overcome drug and alcohol addiction through comprehensive
                recovery programs, life skills training, and unwavering
                community support.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/donate" className="btn-secondary text-lg px-8">
                  <Heart size={22} />
                  Donate Now
                </Link>
                <Link to="/get-help" className="btn-emerald text-lg px-8">
                  Get Help Today
                  <ArrowRight size={20} />
                </Link>
              </div>

              {/* Quick contact */}
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-primary-300">
                <a
                  href="tel:+263775772277"
                  className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                >
                  <Phone size={16} />
                  +263 77 577 2277
                </a>
                <a
                  href="https://wa.me/263775772277"
                  className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                >
                  <span>💬</span>
                  WhatsApp Support
                </a>
              </div>
            </div>

            {/* Hero Stats - Diamond Cards */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {impactStats.map((stat, index) => (
                  <div
                    key={index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <StatCard
                      icon={stat.icon}
                      number={stat.number}
                      label={stat.label}
                      description={stat.description}
                      variant="gradient"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider - Diamond inspired */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f8f6ff"
            />
          </svg>
        </div>
      </section>

      {/* Mobile Stats - Royal theme */}
      <section
        className="lg:hidden py-12"
        style={{
          background:
            "linear-gradient(135deg, #f8f6ff 0%, #fef7fb 50%, #f5f0fb 100%)",
        }}
      >
        <div className="container-custom">
          <StatsGrid stats={impactStats} variant="white" columns={2} />
        </div>
      </section>

      {/* Founder's Message Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-5/12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary-400 to-primary-400 rounded-2xl rotate-6 transform translate-x-2 translate-y-2 group-hover:rotate-4 transition-transform duration-300"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/5] bg-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&fit=crop"
                    alt="Sibongile Maonde Sokhani - Founder"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80"></div>

                  {/* Name Tag on Image */}
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="font-bold text-xl font-display tracking-wide">
                      Sibongile Maonde Sokhani
                    </p>
                    <p className="text-secondary-300 text-sm font-medium uppercase tracking-wider mt-1">
                      Founder & Visionary
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-7/12">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-secondary-500"></span>
                <span className="text-secondary-600 font-semibold tracking-wide uppercase text-sm">
                  Founder's Message
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 font-display leading-tight">
                "They are not just{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-600 to-primary-600">
                  numbers.
                </span>
                <br />
                They are our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  future.
                </span>
                "
              </h2>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-light">
                <p>
                  <span className="text-4xl text-secondary-400 font-serif float-left mr-2 leading-none">
                    "
                  </span>
                  Manake was born out of a mother's heart and a community's
                  need. I watched too many bright lights dim due to
                  circumstances beyond their control. Addiction is not a moral
                  failing; it is a battle for the soul of our youth.
                </p>
                <p>
                  Our mission is simple yet profound: to restore dignity,
                  reignite purpose, and rebuild families. When you walk through
                  our doors, you are not a 'patient' or a 'case'—you are family.
                  And in this family, no one fights alone.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/team"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                >
                  Meet Our Team <ArrowRight size={18} />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 border border-gray-200 px-8 py-3 rounded-full font-medium hover:border-secondary-500 hover:text-secondary-600 transition-colors"
                >
                  Our Story
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 font-display">
                    2019
                  </p>
                  <p className="text-gray-500 text-sm">Established</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-900 font-display">
                    500+
                  </p>
                  <p className="text-gray-500 text-sm">Lives Touched</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-900 font-display">
                    100%
                  </p>
                  <p className="text-gray-500 text-sm">Commitment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <EmergencyWidget variant="card" />

      {/* Featured Story Section */}
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, #f8f6ff 0%, #fef7fb 50%, #f5f0fb 100%)",
        }}
      >
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Real Stories of Transformation</h2>
            <p className="section-subheading mx-auto">
              Every story is a testament to the power of hope, support, and
              second chances.
            </p>
          </div>

          {/* Featured Story - Royal gradient card */}
          <div
            className="rounded-3xl overflow-hidden mb-12 shadow-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(107, 76, 154, 0.1) 0%, rgba(244, 164, 211, 0.1) 100%)",
            }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1542300058-b94b8ab7411b?auto=format&fit=crop&q=80&w=800"
                  alt="Tendai's transformation story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className="text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffd700 0%, #d4a000 100%)",
                    }}
                  >
                    <Sparkles size={14} />
                    Featured Story
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <blockquote className="text-2xl md:text-3xl font-bold text-cosmic-deep mb-6 leading-relaxed">
                  "I thought my life was over at 19. Addicted to crystal meth, I
                  had lost everything. Manake didn't just help me recover—they
                  helped me find my purpose."
                </blockquote>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #6b4c9a 0%, #9b7ec4 100%)",
                    }}
                  >
                    T
                  </div>
                  <div>
                    <p className="font-bold text-cosmic-deep">Tendai M., 24</p>
                    <p className="text-primary-600">
                      Now a certified electrician & business owner
                    </p>
                  </div>
                </div>
                <Link
                  to="/stories"
                  className="text-primary-600 font-semibold hover:text-accent-500 flex items-center gap-2 group"
                >
                  Read More Success Stories
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Feed */}
      <StoriesFeed limit={6} showFilters={false} title="More Success Stories" />

      {/* Programs Section - Royal Theme */}
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, #f8f6ff 0%, #fef7fb 50%, #f5f0fb 100%)",
        }}
      >
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Programs</h2>
            <p className="section-subheading mx-auto">
              Comprehensive support from recovery to rebuilding a fulfilling
              life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🏥",
                title: "Residential Recovery",
                description:
                  "6-month comprehensive program with 24/7 support, counseling, and medical care.",
                duration: "6 months",
                color: "primary",
              },
              {
                icon: "💼",
                title: "Life Skills Training",
                description:
                  "Practical training in vocational skills, financial literacy, and entrepreneurship.",
                duration: "3 months",
                color: "emerald",
              },
              {
                icon: "👨‍👩‍👧‍👦",
                title: "Family Counseling",
                description:
                  "Rebuilding trust and communication within families affected by addiction.",
                duration: "Ongoing",
                color: "accent",
              },
              {
                icon: "🤝",
                title: "Peer Support Groups",
                description:
                  "Weekly group sessions led by recovery graduates for ongoing support.",
                duration: "Weekly",
                color: "primary",
              },
              {
                icon: "📚",
                title: "Education Support",
                description:
                  "Help returning to school or pursuing GED and further education.",
                duration: "Flexible",
                color: "emerald",
              },
              {
                icon: "🚀",
                title: "Employment Assistance",
                description:
                  "Job training, resume building, and placement support after recovery.",
                duration: "As needed",
                color: "accent",
              },
            ].map((program, index) => (
              <div
                key={index}
                className="feature-card flex flex-col hover:shadow-xl"
              >
                <span className="text-4xl mb-4">{program.icon}</span>
                <h3 className="text-xl font-bold text-cosmic-deep mb-2">
                  {program.title}
                </h3>
                <p className="text-primary-700 mb-4 flex-grow">
                  {program.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-600 flex items-center gap-1">
                    <Calendar size={14} />
                    {program.duration}
                  </span>
                  <Link
                    to="/programs"
                    className="text-accent-500 font-medium text-sm hover:text-accent-600"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/programs" className="btn-primary">
              <BookOpen size={20} />
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* MET + Media Section - Royal Theme */}
      <section className="py-16" style={{ background: "#ffffff" }}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Community Empowerment: MET</h2>
            <p className="section-subheading mx-auto">
              Manake Empowerment Trust (MET), formerly known as TODAY'S WOMEN OF
              TRAFALGAR, supports social and economic development in Norton,
              Mashonaland West — empowering women, youth, and people recovering
              from substance abuse.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="feature-card">
              <h3 className="text-xl font-bold text-cosmic-deep mb-4 flex items-center gap-2">
                <span className="text-gold-500">◆</span> What MET does
              </h3>
              <ul className="space-y-3 text-primary-800">
                <li>
                  <span className="font-semibold text-primary-600">
                    Skills training &amp; livelihoods:
                  </span>{" "}
                  Entrepreneurship and vocational training for income-generating
                  skills.
                </li>
                <li>
                  <span className="font-semibold text-primary-600">
                    Substance abuse reform:
                  </span>{" "}
                  Works with partners supporting rehabilitation and
                  reintegration.
                </li>
                <li>
                  <span className="font-semibold text-primary-600">
                    GBV advocacy:
                  </span>{" "}
                  Community action addressing GBV and related social challenges.
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/about#met" className="btn-primary">
                  Learn More About MET
                </Link>
              </div>
            </div>

            <div className="feature-card">
              <h3 className="text-xl font-bold text-cosmic-deep mb-4 flex items-center gap-2">
                <span className="text-gold-500">◆</span> Videos &amp; Media
              </h3>
              <p className="text-primary-700 mb-6">
                Watch highlights from programs and community events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/about#videos" className="btn-secondary">
                  Watch Videos
                </Link>
                <Link to="/about" className="btn-accent">
                  View All Media Links
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation CTA Section - Royal Theme */}
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, #f8f6ff 0%, #fef7fb 50%, #f5f0fb 100%)",
        }}
      >
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <DonationForm />
            </div>
            <div className="order-first lg:order-last">
              <h2 className="section-heading">Your Donation Saves Lives</h2>
              <p className="text-lg text-primary-700 mb-8">
                Every contribution directly supports a young person's journey
                from addiction to hope. Here's how your donation makes a
                difference:
              </p>

              <ul className="space-y-4">
                {[
                  {
                    amount: "$10",
                    impact: "Provides educational materials for one youth",
                  },
                  {
                    amount: "$25",
                    impact: "Covers meals and accommodation for one week",
                  },
                  {
                    amount: "$50",
                    impact: "Funds two weeks of counseling sessions",
                  },
                  {
                    amount: "$100",
                    impact: "Supports one month of life skills training",
                  },
                  {
                    amount: "$250",
                    impact: "Sponsors a youth's complete 3-month program",
                  },
                ].map((item, index) => (
                  <li key={index} className="flex gap-4 items-start">
                    <span
                      className="font-bold px-3 py-1 rounded-lg text-sm text-cosmic-deep"
                      style={{
                        background:
                          "linear-gradient(135deg, #ffd700 0%, #fef3c7 100%)",
                      }}
                    >
                      {item.amount}
                    </span>
                    <span className="text-primary-800">{item.impact}</span>
                  </li>
                ))}
              </ul>

              <div
                className="mt-8 p-6 rounded-xl border-2"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(80, 200, 120, 0.1) 0%, rgba(110, 231, 183, 0.1) 100%)",
                  borderColor: "rgba(80, 200, 120, 0.3)",
                }}
              >
                <p className="text-emerald-700 font-medium flex items-center gap-2">
                  <span className="text-lg">💎</span> 100% of your donation goes
                  directly to our programs. Administrative costs are covered by
                  our founding sponsors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Royal Theme */}
      <section className="py-16" style={{ background: "#ffffff" }}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">What People Say</h2>
            <p className="section-subheading mx-auto">
              Words from families, graduates, and supporters of Manake.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Cosmic Royal Gradient */}
      <section
        className="py-20 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a0f2e 0%, #2d1b69 50%, #6b4c9a 100%)",
        }}
      >
        {/* Sparkle effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-2 h-2 bg-gold-400 rounded-full animate-sparkle" />
          <div
            className="absolute bottom-20 right-40 w-3 h-3 bg-gold-500 rounded-full animate-sparkle"
            style={{ animationDelay: "0.7s" }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-2 h-2 bg-accent-400 rounded-full animate-sparkle"
            style={{ animationDelay: "1.2s" }}
          />
        </div>

        <div className="container-custom text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a{" "}
            <span className="bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
              Difference
            </span>
            ?
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
            Whether you want to get help, donate, or volunteer, we'd love to
            hear from you. Together, we can transform lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate" className="btn-secondary text-lg px-8">
              <Heart size={22} />
              Donate Now
            </Link>
            <Link to="/get-help" className="btn-emerald text-lg px-8">
              Get Help Today
            </Link>
            <Link to="/contact" className="btn-accent text-lg px-8">
              Contact Us
            </Link>
          </div>
          <p className="mt-8 text-primary-300 text-sm">
            Developed with <Heart size={14} className="inline text-red-500" />{" "}
            by{" "}
            <span className="text-gold-400 font-medium">
              Munyaradzi Chenjerai
            </span>
          </p>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <EmergencyWidget variant="floating" />
    </>
  );
};
