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
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&fit=crop&q=80", // African healthcare
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
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fit=crop&q=80", // Zimbabwe youth group
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
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&fit=crop&q=80", // African vocational/school
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
        "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&fit=crop&q=80", // African family/group
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
        "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&fit=crop&q=80", // African children community outreach
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
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&fit=crop&q=80", // Zimbabwe alumni peer circle
      color: "accent",
    },
  ];

  return (
    <>
      <section
        className="relative text-white py-16"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(74,32,105,0.92) 0%, rgba(26,15,46,0.95) 100%), url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="container-custom">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Our Programs</h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            Comprehensive care from detox to aftercare, life skills, and
            community reintegration tailored for Zimbabwean youth.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom grid lg:grid-cols-3 gap-8">
          {programs.map((program, idx) => (
            <div key={program.id} className={idx === 0 ? "lg:col-span-3" : ""}>
              <ProgramCard
                program={program}
                variant={idx === 0 ? "featured" : "default"}
              />
            </div>
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
