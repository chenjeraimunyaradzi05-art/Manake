import { ProgramCard } from "../components/ProgramCard";
import { ArrowRight } from "lucide-react";

export const ProgramsPage = () => {
  const programs = [
    {
      id: "residential",
      title: "Residential Recovery (6 months)",
      description:
        "24/7 supervised care, counseling, medical oversight, and structured routine.",
      duration: "6 months",
      capacity: "30 beds",
      features: [
        "Medical detox & monitoring",
        "Individual + group therapy",
        "Daily routine with wellness & fitness",
        "Relapse prevention curriculum",
      ],
      image:
        "https://images.unsplash.com/photo-1579389083395-4507e98b5e67?w=800", // African doctor/patient
      color: "primary",
    },
    {
      id: "outpatient",
      title: "Outpatient & Aftercare",
      description:
        "For graduates and those not needing residential care; weekly counseling & peer groups.",
      duration: "3-6 months",
      capacity: "Flexible",
      features: [
        "Weekly therapy + peer support",
        "Case management & urine screening",
        "Family check-ins",
        "Return-to-school/work planning",
      ],
      image:
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800", // Group meeting
      color: "secondary",
    },
    {
      id: "life-skills",
      title: "Life Skills & Vocational Training",
      description:
        "Entrepreneurship, trades, digital skills, and financial literacy to prevent relapse.",
      duration: "12 weeks",
      capacity: "Cohorts of 20",
      features: [
        "Carpentry, catering, basic IT",
        "Job placement support",
        "Micro-grants for startups",
        "Mentorship by alumni",
      ],
      image:
        "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800", // Learning/working
      color: "accent",
    },
    {
      id: "family",
      title: "Family Counseling & Reintegration",
      description:
        "Rebuild trust, communication, and safe home plans for returning youth.",
      duration: "8 weeks",
      capacity: "Families in program",
      features: [
        "Mediation & healing sessions",
        "Parent coaching for relapse warning signs",
        "Safety plans & boundaries",
        "Sibling inclusion when appropriate",
      ],
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800", // Group of people walking (Family) - Kept as it is good but verified context
      color: "primary",
    },
    {
      id: "schools",
      title: "School & Community Outreach",
      description:
        "Prevention and early identification talks with schools, churches, and clinics.",
      duration: "Ongoing",
      capacity: "Workshops & roadshows",
      features: [
        "Peer ambassadors",
        "Teacher & nurse toolkits",
        "WhatsApp hotline promotion",
        "Referral pathways",
      ],
      image:
        "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=800", // Boys outside (Community) - Kept as it is good but verified context
      color: "secondary",
    },
    {
      id: "alumni",
      title: "Alumni & Peer Support",
      description:
        "Graduates mentor current residents, run weekly circles, and lead outreach.",
      duration: "Ongoing",
      capacity: "Alumni network",
      features: [
        "Weekly peer circles",
        "Leadership training",
        "Community volunteering",
        "Path to staff roles",
      ],
      image:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800", // Group meeting diverse
      color: "accent",
    },
  ];

  return (
    <>
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Programs</h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            Comprehensive care from detox to aftercare, life skills, and
            community reintegration tailored for Zimbabwean youth.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom grid lg:grid-cols-3 gap-8">
          {programs.map((program, idx) => (
            <ProgramCard
              key={program.id}
              program={program}
              variant={idx === 0 ? "featured" : "default"}
            />
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom text-center">
          <h2 className="section-heading mb-4">Not Sure Where to Start?</h2>
          <p className="section-subheading mx-auto mb-8">
            Speak with an intake counselor to choose the right program for your
            situation.
          </p>
          <a href="tel:+263775772277" className="btn-primary">
            Talk to Intake <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
};
