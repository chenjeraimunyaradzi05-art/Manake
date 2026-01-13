import { Users, Heart, Sparkles, Quote } from "lucide-react";
import { Link } from "react-router-dom";

export const TeamPage = () => {
  const teamMembers = [
    {
      id: 0,
      name: "Sibongile Maonde Sokhani",
      role: "Founder & Inspiration",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&fit=crop",
      bio: "As the visionary founder of Manake, Sibongile is the driving force behind our mission. Her unwavering belief in the potential of every young person inspires our entire community.",
    },
    {
      id: 1,
      name: "The Manake Team",
      role: "Dedicated Staff & Volunteers",
      image: "/images/team/team.jpeg",
      bio: "Our passionate team of counselors, therapists, and support staff work tirelessly to guide youth through their recovery journey. Together, we create a safe and nurturing environment for healing.",
    },
    {
      id: 2,
      name: "Community Partners",
      role: "The Movement Behind Manake",
      image: "/images/team/manaketeam.jpeg",
      bio: "Manake is more than a rehabilitation center—it's a movement. Our community partners, volunteers, and supporters form the backbone of everything we do.",
    },
    {
      id: 3,
      name: "Youth & Families",
      role: "The Heart of Our Mission",
      image: "/images/team/manake.jpeg",
      bio: "The youth we serve and their families are at the center of our work. Their courage, resilience, and commitment to recovery inspire us every day.",
    },
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Compassion First",
      description:
        "We approach every person with empathy, understanding, and unconditional support.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description:
        "Recovery happens in community. We build connections that last a lifetime.",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Transformative Care",
      description:
        "We believe in the power of holistic healing—mind, body, and spirit.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-700 via-secondary-800 to-primary-900 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-accent-300" />
              <span className="text-accent-200 font-medium">Our People</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The Team Behind the Movement
            </h1>
            <p className="text-xl text-secondary-100 leading-relaxed mb-8">
              Meet the dedicated individuals who make Manake's mission possible.
              From our staff to our community partners, every person plays a
              vital role in transforming lives.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Join Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Team Values */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                  {value.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Community
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manake is powered by a diverse team of professionals, volunteers,
              and community members who share one common goal: helping youth
              reclaim their futures.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium text-sm mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="w-12 h-12 text-primary-400 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-6">
              "Recovery is not a solo journey. It takes a village—and at Manake,
              we are that village. Every person who walks through our doors
              becomes part of our family."
            </blockquote>
            <cite className="text-primary-300 not-italic block font-medium">
              — Sibongile Maonde Sokhani, Founder
            </cite>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-gradient-to-r from-gold-400 to-gold-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Be Part of the Movement
          </h2>
          <p className="text-lg text-gray-800 max-w-2xl mx-auto mb-8">
            Whether you want to volunteer, donate, or partner with us, there's a
            place for you in the Manake community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Get Involved
            </Link>
            <Link
              to="/donate"
              className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Support Our Mission
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
