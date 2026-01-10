import { Link } from "react-router-dom";
import { Clock, Users, CheckCircle, ArrowRight } from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  capacity: string;
  features: string[];
  image: string;
  color: string;
}

interface ProgramCardProps {
  program: Program;
  variant?: "default" | "featured";
}

export const ProgramCard = ({
  program,
  variant = "default",
}: ProgramCardProps) => {
  if (variant === "featured") {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-auto">
            <img
              src={program.image}
              alt={program.title}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-${program.color}-900/70 to-transparent`}
            />
          </div>
          <div className="p-8">
            <span
              className={`inline-block bg-${program.color}-100 text-${program.color}-700 text-sm font-semibold px-3 py-1 rounded-full mb-4`}
            >
              Featured Program
            </span>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              {program.title}
            </h3>
            <p className="text-gray-600 mb-6">{program.description}</p>

            <div className="flex gap-6 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary-600" />
                <span>{program.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary-600" />
                <span>{program.capacity}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {program.features.slice(0, 4).map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-600"
                >
                  <CheckCircle
                    size={18}
                    className="text-green-500 flex-shrink-0 mt-0.5"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to={`/programs/${program.id}`} className="btn-primary">
              Learn More <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-hover flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white">{program.title}</h3>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <p className="text-gray-600 mb-4 flex-grow">{program.description}</p>

        <div className="flex gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{program.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{program.capacity}</span>
          </div>
        </div>

        <Link
          to={`/programs/${program.id}`}
          className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 group"
        >
          Learn More
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
};
