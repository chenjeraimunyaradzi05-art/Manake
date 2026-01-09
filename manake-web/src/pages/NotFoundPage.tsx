import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="max-w-md">
        <div className="text-7xl mb-4">😕</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist. Let's get you back on track.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};
