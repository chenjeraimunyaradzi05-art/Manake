interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  image?: string;
  rating?: number;
}

export const TestimonialCard = ({ 
  quote, 
  author, 
  role, 
  image,
  rating = 5 
}: TestimonialCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg relative">
      {/* Quote mark */}
      <div className="absolute top-6 left-6 text-6xl text-primary-100 font-serif leading-none">
        "
      </div>
      
      {/* Rating */}
      {rating > 0 && (
        <div className="flex gap-1 mb-4 relative z-10">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}
            >
              ★
            </span>
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-gray-700 text-lg mb-6 relative z-10 italic leading-relaxed">
        {quote}
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        {image ? (
          <img 
            src={image} 
            alt={author}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-bold text-lg">
              {author.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <div className="font-bold text-gray-900">{author}</div>
          <div className="text-sm text-gray-500">{role}</div>
        </div>
      </div>
    </div>
  );
};

interface TestimonialsGridProps {
  testimonials: TestimonialCardProps[];
}

export const TestimonialsGrid = ({ testimonials }: TestimonialsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <TestimonialCard key={index} {...testimonial} />
      ))}
    </div>
  );
};
