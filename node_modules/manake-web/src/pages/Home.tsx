import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Users, TrendingUp, Award, Calendar, Phone, BookOpen } from 'lucide-react';
import { StoriesFeed } from '../components/StoriesFeed';
import { DonationForm } from '../components/DonationForm';
import { EmergencyWidget } from '../components/EmergencyWidget';
import { StatCard, StatsGrid } from '../components/StatCard';
import { TestimonialCard } from '../components/TestimonialCard';

export const HomePage = () => {
  const impactStats = [
    { icon: <Users size={32} />, number: '500+', label: 'Youth Helped', description: 'Lives transformed' },
    { icon: <TrendingUp size={32} />, number: '85%', label: 'Success Rate', description: 'Stay sober after 1 year' },
    { icon: <Heart size={32} />, number: '1,000+', label: 'Donors', description: 'Supporting our mission' },
    { icon: <Award size={32} />, number: '5', label: 'Years', description: 'Serving Zimbabwe' },
  ];

  const testimonials = [
    {
      quote: "Manake saved my son's life. The team truly cares about each individual and their family. We are forever grateful.",
      author: "Mrs. Moyo",
      role: "Parent of Graduate",
      rating: 5
    },
    {
      quote: "I thought my life was over at 19. Manake showed me there's always a way back. Now I'm running my own business!",
      author: "Tendai M.",
      role: "Graduate, Class of 2024",
      rating: 5
    },
    {
      quote: "The life skills training was a game-changer. I didn't just recover, I discovered my purpose.",
      author: "Chipo N.",
      role: "Graduate & Mentor",
      rating: 5
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        
        <div className="container-custom relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="text-center lg:text-left">
              <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
                Zimbabwe's Premier Youth Rehabilitation Center
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Recovery is <span className="text-secondary-400">Possible.</span>
                <br />
                Hope is <span className="text-hope">Powerful.</span>
              </h1>
              
              <p className="text-xl text-primary-100 mb-8 max-w-xl mx-auto lg:mx-0">
                Manake Rehabilitation Center empowers youth in Zimbabwe to overcome drug 
                and alcohol addiction through comprehensive recovery programs, life skills 
                training, and unwavering community support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/donate" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 text-lg px-8">
                  <Heart size={22} />
                  Donate Now
                </Link>
                <Link to="/get-help" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8">
                  Get Help Today
                  <ArrowRight size={20} />
                </Link>
              </div>

              {/* Quick contact */}
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-primary-200">
                <a href="tel:+263775772277" className="flex items-center gap-2 hover:text-white">
                  <Phone size={16} />
                  +263 77 577 2277
                </a>
                <a href="https://wa.me/263775772277" className="flex items-center gap-2 hover:text-white">
                  <span>💬</span>
                  WhatsApp Support
                </a>
              </div>
            </div>

            {/* Hero Image/Stats */}
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

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Mobile Stats - shown on mobile only */}
      <section className="lg:hidden bg-gray-50 py-12">
        <div className="container-custom">
          <StatsGrid stats={impactStats} variant="white" columns={2} />
        </div>
      </section>

      {/* Emergency Banner */}
      <EmergencyWidget variant="card" />

      {/* Featured Story Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Real Stories of Transformation</h2>
            <p className="section-subheading mx-auto">
              Every story is a testament to the power of hope, support, and second chances.
            </p>
          </div>

          {/* Featured Story */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl overflow-hidden mb-12">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1542300058-b94b8ab7411b?auto=format&fit=crop&q=80&w=800"
                  alt="Tendai's transformation story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-accent-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                    ⭐ Featured Story
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <blockquote className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-relaxed">
                  "I thought my life was over at 19. Addicted to crystal meth, I had lost everything. 
                  Manake didn't just help me recover—they helped me find my purpose."
                </blockquote>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    T
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Tendai M., 24</p>
                    <p className="text-gray-600">Now a certified electrician & business owner</p>
                  </div>
                </div>
                <Link 
                  to="/stories" 
                  className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 group"
                >
                  Read More Success Stories
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Feed */}
      <StoriesFeed limit={6} showFilters={false} title="More Success Stories" />

      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Programs</h2>
            <p className="section-subheading mx-auto">
              Comprehensive support from recovery to rebuilding a fulfilling life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🏥',
                title: 'Residential Recovery',
                description: '6-month comprehensive program with 24/7 support, counseling, and medical care.',
                duration: '6 months',
                color: 'primary'
              },
              {
                icon: '💼',
                title: 'Life Skills Training',
                description: 'Practical training in vocational skills, financial literacy, and entrepreneurship.',
                duration: '3 months',
                color: 'secondary'
              },
              {
                icon: '👨‍👩‍👧‍👦',
                title: 'Family Counseling',
                description: 'Rebuilding trust and communication within families affected by addiction.',
                duration: 'Ongoing',
                color: 'accent'
              },
              {
                icon: '🤝',
                title: 'Peer Support Groups',
                description: 'Weekly group sessions led by recovery graduates for ongoing support.',
                duration: 'Weekly',
                color: 'primary'
              },
              {
                icon: '📚',
                title: 'Education Support',
                description: 'Help returning to school or pursuing GED and further education.',
                duration: 'Flexible',
                color: 'secondary'
              },
              {
                icon: '🚀',
                title: 'Employment Assistance',
                description: 'Job training, resume building, and placement support after recovery.',
                duration: 'As needed',
                color: 'accent'
              },
            ].map((program, index) => (
              <div 
                key={index} 
                className="card-hover p-6 flex flex-col"
              >
                <span className="text-4xl mb-4">{program.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{program.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {program.duration}
                  </span>
                  <Link 
                    to="/programs" 
                    className="text-primary-600 font-medium text-sm hover:text-primary-700"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/programs" className="btn-secondary">
              <BookOpen size={20} />
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* MET + Media Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Community Empowerment: MET</h2>
            <p className="section-subheading mx-auto">
              Manake Empowerment Trust (MET), formerly known as TODAY'S WOMEN OF TRAFALGAR, supports social and economic development in Norton, Mashonaland West —
              empowering women, youth, and people recovering from substance abuse.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What MET does</h3>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">Skills training &amp; livelihoods:</span> Entrepreneurship and vocational training for income-generating skills.
                </li>
                <li>
                  <span className="font-semibold">Substance abuse reform:</span> Works with partners supporting rehabilitation and reintegration.
                </li>
                <li>
                  <span className="font-semibold">GBV advocacy:</span> Community action addressing GBV and related social challenges.
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/about#met" className="btn-secondary">
                  Learn More About MET
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Videos &amp; Media</h3>
              <p className="text-gray-700 mb-6">
                Watch highlights from programs and community events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/about#videos" className="btn-primary">
                  Watch Videos
                </Link>
                <Link to="/about" className="btn-secondary">
                  View All Media Links
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <DonationForm />
            </div>
            <div className="order-first lg:order-last">
              <h2 className="section-heading">Your Donation Saves Lives</h2>
              <p className="text-lg text-gray-600 mb-8">
                Every contribution directly supports a young person's journey from addiction to hope. 
                Here's how your donation makes a difference:
              </p>
              
              <ul className="space-y-4">
                {[
                  { amount: '$10', impact: 'Provides educational materials for one youth' },
                  { amount: '$25', impact: 'Covers meals and accommodation for one week' },
                  { amount: '$50', impact: 'Funds two weeks of counseling sessions' },
                  { amount: '$100', impact: 'Supports one month of life skills training' },
                  { amount: '$250', impact: 'Sponsors a youth\'s complete 3-month program' },
                ].map((item, index) => (
                  <li key={index} className="flex gap-4 items-start">
                    <span className="bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded-lg text-sm">
                      {item.amount}
                    </span>
                    <span className="text-gray-700">{item.impact}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-800 font-medium">
                  💚 100% of your donation goes directly to our programs. 
                  Administrative costs are covered by our founding sponsors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
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

      {/* Final CTA */}
      <section className="py-20 gradient-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Whether you want to get help, donate, or volunteer, we'd love to hear from you.
            Together, we can transform lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 text-lg px-8">
              <Heart size={22} />
              Donate Now
            </Link>
            <Link to="/get-help" className="btn-secondary border-white text-white hover:bg-white/10 text-lg px-8">
              Get Help Today
            </Link>
            <Link to="/contact" className="btn-secondary border-white text-white hover:bg-white/10 text-lg px-8">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <EmergencyWidget variant="floating" />
    </>
  );
};
