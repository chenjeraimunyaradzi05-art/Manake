import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Stories', path: '/stories' },
    { name: 'Programs', path: '/programs' },
    { name: 'Get Help', path: '/get-help' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const userInitials = useMemo(() => {
    if (user.name) {
      return user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    }
    if (user.email) return user.email[0]?.toUpperCase();
    return 'M';
  }, [user.name, user.email]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main navigation */}
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-primary-700">Manake</span>
              <span className="text-xs text-gray-500 hidden sm:block">Rehabilitation Center</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Donate + User */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/donate"
              className="btn-primary text-sm"
            >
              <Heart size={18} />
              Donate Now
            </Link>

            {user.isLoggedIn ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User avatar'}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center">
                    {userInitials}
                  </div>
                )}
                <div className="flex flex-col text-xs leading-tight">
                  <span className="font-semibold text-gray-900">{user.name || 'Logged in'}</span>
                  <span className="text-gray-500">{user.email || 'Welcome back'}</span>
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700">
                      <Shield size={12} /> Admin
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-700 text-xs font-medium"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                <User size={16} className="inline mr-2" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/donate"
                onClick={() => setIsOpen(false)}
                className="btn-primary mt-4 mx-4"
              >
                <Heart size={18} />
                Donate Now
              </Link>

              {user.isLoggedIn ? (
                <div className="mx-4 mt-2 p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User avatar'}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center">
                        {userInitials}
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{user.name || 'Logged in'}</p>
                      <p className="text-gray-500">{user.email || 'Welcome back'}</p>
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700">
                          <Shield size={12} /> Admin
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="text-xs font-medium text-gray-600 hover:text-primary-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="mx-4 mt-2 px-4 py-3 rounded-lg font-semibold text-center border border-gray-200 hover:border-primary-200 hover:text-primary-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
