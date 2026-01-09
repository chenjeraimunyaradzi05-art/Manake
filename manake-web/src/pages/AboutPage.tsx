import { Target, HeartHandshake, Leaf, Award, Globe2 } from 'lucide-react';

export const AboutPage = () => {
  const values = [
    { icon: <HeartHandshake className="w-6 h-6" />, title: 'Compassion', text: 'We meet every youth with empathy and dignity.' },
    { icon: <Target className="w-6 h-6" />, title: 'Results', text: 'Evidence-based care with measurable outcomes.' },
    { icon: <Leaf className="w-6 h-6" />, title: 'Hope', text: 'Recovery is possible; we walk the journey together.' },
    { icon: <Globe2 className="w-6 h-6" />, title: 'Community', text: 'Family, peers, and partners are part of healing.' },
  ];

  const milestones = [
    { number: '2019', label: 'Founded in Harare' },
    { number: '500+', label: 'Youth served' },
    { number: '85%', label: '1-year sobriety rate' },
    { number: '8', label: 'Active programs' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Manake Rehabilitation Center</h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            Empowering youth in Zimbabwe to overcome drug and alcohol addiction through recovery, life skills, and community support.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container-custom grid md:grid-cols-2 gap-10 items-start">
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To provide youth-focused, evidence-based rehabilitation that restores dignity, rebuilds families, and equips young people with life skills to thrive beyond addiction.
            </p>
          </div>
          <div className="bg-secondary-50 border border-secondary-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              A Zimbabwe where every young person struggling with addiction has a clear path to recovery, purpose, and meaningful contribution to society.
            </p>
          </div>
        </div>
      </section>

      {/* MET Overview */}
      <section id="met" className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-heading">Manake Empowerment Trust (MET)</h2>
            <p className="section-subheading mx-auto">
              Formerly known as TODAY'S WOMEN OF TRAFALGAR, MET is a Zimbabwean community-based organization active in Norton, Mashonaland West.
              It advances social and economic development by empowering vulnerable groups — including women, youth, and people recovering from substance abuse.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Initiatives</h3>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">Skills Training &amp; Livelihood Development:</span> Entrepreneurship and vocational training that equips community members with income-generating skills. In November 2025, MET held a graduation for 300+ program completers.
                </li>
                <li>
                  <span className="font-semibold">Substance Abuse Reform:</span> A recognized partner of the Zimbabwean government in combating drug and substance abuse. In early 2025, MET was commended for training 240+ drug abuse reformers in life-changing skills.
                </li>
                <li>
                  <span className="font-semibold">Gender-Based Violence (GBV) Advocacy:</span> Community campaigns that address GBV and its links to broader social challenges, including substance abuse.
                </li>
                <li>
                  <span className="font-semibold">Product Showcasing:</span> Graduates showcase and market products developed through their newly acquired skills.
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Alignment &amp; Partnerships</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                MET’s initiatives align with Zimbabwe’s Vision 2030 roadmap. The trust frequently collaborates with the Ministry of Women Affairs, Community,
                Small and Medium Enterprises Development, with national and local leaders often officiating at graduations and community events.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h4 className="font-semibold text-gray-900 mb-2">What this means for our work</h4>
                <p className="text-gray-700">
                  A stronger pipeline from recovery to reintegration: practical skills, safer communities, and partnerships that support sustainable livelihoods.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos & Media */}
      <section id="videos" className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-heading">Videos &amp; Media</h2>
            <p className="section-subheading mx-auto">
              Watch highlights from programs and community events.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/5fstP-eHgLY"
                  title="Manake Empowerment Trust video 1"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/zDpKhOmha9g"
                  title="Manake Empowerment Trust video 2"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">More links</h3>
            <div className="grid md:grid-cols-2 gap-3 text-gray-700">
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://www.facebook.com/share/v/1ATpQVCkJw/">
                Facebook video
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://www.tiktok.com/@mr_billz1/video/7540289026524253453?is_from_webapp=1&sender_device=pc">
                TikTok video
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/AR74TYAqbE90JzUfQ">
                Google share link 1
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/Koefg2aqL0n3SUEbM">
                Google share link 2
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/onxUXvhfx0gvezoIp">
                Google share link 3
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/4Ei2cO2Oe4ysirwJG">
                Google share link 4
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/TQseKshHB68OKCFZd">
                Google share link 5
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/cmRqdhf0bsAwt6PPX">
                Google share link 6
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/BEElSfdjIE5GXdIf9">
                Google share link 7
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/nwGXLPJAEbae0Gt3l">
                Google share link 8
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/tslphoFdTnrxAKXNt">
                Google share link 9
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/OgPG3qSsurg3jso5N">
                Google share link 10
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/ziAJy54VZryAptsAy">
                Google share link 11
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/mtFvFFFoSAcPainA2">
                Google share link 12
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/gkC62oVenxzV3lGbN">
                Google share link 13
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/8toWZUyFfRLDkx97f">
                Google share link 14
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/Jj2yAIaVyf4Md9FES">
                Google share link 15
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/zPv28U3JnxzOQv31C">
                Google share link 16
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/ZSrIvvfXw2RRh2NRo">
                Google share link 17
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/kWOGG1jRb1jYhY47F">
                Google share link 18
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/BiWxBBRuT4SHGyIio">
                Google share link 19
              </a>
              <a className="hover:text-primary-700 underline" target="_blank" rel="noreferrer" href="https://share.google/Vaof8s3Xro468kNxa">
                Google share link 20
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="section-heading text-center mb-10">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="card-hover p-6 text-center h-full">
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  {value.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-white">
        <div className="container-custom grid md:grid-cols-4 gap-6">
          {milestones.map((m, idx) => (
            <div key={idx} className="text-center bg-gray-50 rounded-2xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-primary-700 mb-1">{m.number}</div>
              <div className="text-gray-600">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-heading">Meet the Team</h2>
            <p className="section-subheading mx-auto">Licensed counselors, social workers, life skills trainers, and peer mentors.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Ruvimbo Manake', role: 'Founder & Director', desc: 'Leads strategy, partnerships, and quality of care.' },
              { name: 'Dr. Tawanda Moyo', role: 'Clinical Lead', desc: 'Oversees medical protocols and mental health.' },
              { name: 'Chipo Ncube', role: 'Life Skills Lead', desc: 'Designs vocational and entrepreneurship training.' },
              { name: 'Farai Chitsiko', role: 'Peer Support Coordinator', desc: 'Alumnus who runs weekly peer groups.' },
              { name: 'Memory Dube', role: 'Family Therapist', desc: 'Guides family reintegration and counseling.' },
              { name: 'Blessing Zhou', role: 'Programs & M&E', desc: 'Tracks impact metrics and reporting.' },
            ].map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold mb-3">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-primary-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation */}
      <section className="py-12 bg-white">
        <div className="container-custom flex flex-col items-center gap-4 text-center">
          <Award className="w-10 h-10 text-primary-600" />
          <h3 className="text-2xl font-bold">Trusted & Compliant</h3>
          <p className="text-gray-600 max-w-2xl">
            Registered non-profit in Zimbabwe. Follows WHO-aligned substance use treatment guidelines. Data privacy and safeguarding policies in place for youth.
          </p>
        </div>
      </section>
    </>
  );
};
