import { DonationForm } from "../components/DonationForm";
import { Link } from "react-router-dom";
import { Heart, Shield, CheckCircle, Users, TrendingUp } from "lucide-react";

export const DonatePage = () => {
  const impactItems = [
    {
      amount: "$10",
      impact:
        "Provides educational materials and supplies for one youth in recovery",
      icon: "📚",
    },
    {
      amount: "$25",
      impact: "Covers nutritious meals and safe accommodation for one week",
      icon: "🏠",
    },
    {
      amount: "$50",
      impact: "Funds two weeks of individual and group counseling sessions",
      icon: "💬",
    },
    {
      amount: "$100",
      impact:
        "Supports one complete month of life skills and vocational training",
      icon: "💼",
    },
    {
      amount: "$250",
      impact: "Sponsors a youth's complete 3-month intensive recovery program",
      icon: "🌟",
    },
    {
      amount: "$500",
      impact:
        "Funds a full 6-month residential recovery journey for one person",
      icon: "🎓",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Heart className="inline w-4 h-4 mr-1" />
            100% Goes to Programs
          </span>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Transform a Life Today
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Your donation directly supports youth in Zimbabwe overcoming
            addiction and building brighter futures. Every dollar makes a
            difference.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Donation Form */}
            <div>
              <DonationForm />
            </div>

            {/* Impact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Your Impact</h2>
              <p className="text-lg text-gray-600 mb-8">
                See exactly how your generous contribution transforms lives at
                Manake.
              </p>

              <div className="space-y-4">
                {impactItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <span className="inline-block bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded-lg text-sm mb-2">
                        {item.amount}
                      </span>
                      <p className="text-gray-700">{item.impact}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">
                  Why Donate to Manake?
                </h3>
                <ul className="space-y-3">
                  {[
                    "Registered non-profit organization in Zimbabwe",
                    "100% of donations go directly to programs",
                    "Transparent financial reporting",
                    "Tax-deductible donations (where applicable)",
                    "5+ years of proven impact in youth recovery",
                    "85% success rate for program graduates",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Impact So Far</h2>
            <p className="section-subheading mx-auto">
              Thanks to generous donors like you, we've been able to achieve
              remarkable results.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                number: "500+",
                label: "Youth Helped",
                icon: <Users className="w-8 h-8" />,
              },
              {
                number: "85%",
                label: "Success Rate",
                icon: <TrendingUp className="w-8 h-8" />,
              },
              {
                number: "$250K+",
                label: "Raised",
                icon: <Heart className="w-8 h-8" />,
              },
              {
                number: "1,000+",
                label: "Donors",
                icon: <Shield className="w-8 h-8" />,
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Other Ways to Support</h2>
            <p className="section-subheading mx-auto">
              Not able to donate financially? There are other ways you can help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Volunteer Your Time",
                description:
                  "Share your skills, mentor youth, or help with administrative tasks.",
                cta: "Become a Volunteer",
                link: "/volunteer",
                icon: "🤝",
              },
              {
                title: "Corporate Partnership",
                description:
                  "Partner with us for CSR initiatives, employee giving, or sponsorships.",
                cta: "Partner With Us",
                link: "/partner",
                icon: "🏢",
              },
              {
                title: "Spread the Word",
                description:
                  "Share our mission with your network. Follow and share on social media.",
                cta: "Follow Us",
                link: "/contact",
                icon: "📣",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg text-center"
              >
                <span className="text-5xl block mb-4">{item.icon}</span>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-6">{item.description}</p>
                <Link to={item.link} className="btn-secondary">
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl">
          <h2 className="section-heading text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Is my donation tax-deductible?",
                a: "Yes, Manake Rehabilitation Center is a registered non-profit. Donations may be tax-deductible depending on your country's tax laws. We provide receipts for all donations.",
              },
              {
                q: "How is my donation used?",
                a: "100% of your donation goes directly to our programs. Administrative costs are covered by our founding sponsors. Your contribution funds meals, accommodation, counseling, education, and life skills training.",
              },
              {
                q: "Can I set up a recurring donation?",
                a: "Yes! Monthly donations help us plan ahead and provide consistent support to youth in our programs. You can easily set this up during the donation process.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept credit/debit cards (via Stripe), EcoCash mobile money (for Zimbabwe), and direct bank transfers in both USD and ZWL.",
              },
              {
                q: "Can I donate in memory of someone?",
                a: "Absolutely. Contact us and we'll help you set up a memorial donation that honors your loved one while supporting youth recovery.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
