import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  number: string | number;
  label: string;
  description?: string;
  variant?: 'primary' | 'white' | 'gradient';
}

export const StatCard = ({ 
  icon, 
  number, 
  label, 
  description,
  variant = 'primary' 
}: StatCardProps) => {
  const variants = {
    primary: 'bg-primary-500 text-white',
    white: 'bg-white text-gray-900 shadow-lg',
    gradient: 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white',
  };

  return (
    <div className={`rounded-2xl p-6 text-center ${variants[variant]}`}>
      <div className={`flex justify-center mb-3 ${
        variant === 'white' ? 'text-primary-600' : ''
      }`}>
        {icon}
      </div>
      <div className="text-4xl font-bold mb-1">{number}</div>
      <div className={`font-medium ${
        variant === 'white' ? 'text-gray-700' : 'opacity-90'
      }`}>
        {label}
      </div>
      {description && (
        <div className={`text-sm mt-2 ${
          variant === 'white' ? 'text-gray-500' : 'opacity-75'
        }`}>
          {description}
        </div>
      )}
    </div>
  );
};

interface StatsGridProps {
  stats: {
    icon: ReactNode;
    number: string | number;
    label: string;
    description?: string;
  }[];
  variant?: 'primary' | 'white' | 'gradient';
  columns?: 2 | 3 | 4;
}

export const StatsGrid = ({ stats, variant = 'primary', columns = 4 }: StatsGridProps) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          number={stat.number}
          label={stat.label}
          description={stat.description}
          variant={variant}
        />
      ))}
    </div>
  );
};
