import { Link } from 'react-router-dom';
import { CheckCircle, Heart } from 'lucide-react';

export const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-xl text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your support helps Manake Rehabilitation Center empower Zimbabwean youth to overcome addiction and rebuild their lives.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/stories" className="btn-secondary">Read Impact Stories</Link>
          <Link to="/" className="btn-primary">
            <Heart className="w-5 h-5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};
