import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Heart,
  LogOut,
  User,
  Shield,
  MessageCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LOGO_SRC = "/logos/logo-alt-1.png";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Stories", path: "/stories" },
    { name: "Programs", path: "/programs" },
    { name: "Products", path: "/products" },
    { name: "Team", path: "/team" },
    { name: "Social", path: "/social" },
    { name: "Messaging", path: "/messages" },
    { name: "Get Help", path: "/get-help" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const userInitials = useMemo(() => {
    if (user.name) {
      return user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    }
    if (user.email) return user.email[0]?.toUpperCase();
    return "M";
  }, [user.name, user.email]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(135deg, rgba(26, 15, 46, 0.95) 0%, rgba(45, 27, 105, 0.95) 100%)",
      }}
    >
      {/* Main navigation */}
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center shadow-lg">
              <img
                src={LOGO_SRC}
                alt="Manake"
                className="h-full w-full object-contain rounded-md"
                draggable={false}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-gold-400 group-hover:text-gold-300 transition-colors">
                Manake
              </span>
              <span className="text-xs text-primary-300 hidden sm:block">
                Rehabilitation Center
              </span>
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
                    ? "text-gold-400"
                    : "text-primary-200 hover:text-gold-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Donate + User */}
          <div className="hidden md:flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1">
              <Link
                to="/social"
                className="p-2 rounded-lg text-primary-200 hover:text-gold-400 hover:bg-primary-800/50 transition-colors"
                aria-label="Manake Social"
                title="Manake Social"
              >
                <Users size={18} />
              </Link>
              <Link
                to="/messages"
                className="p-2 rounded-lg text-primary-200 hover:text-gold-400 hover:bg-primary-800/50 transition-colors"
                aria-label="Messaging"
                title="Messaging"
              >
                <MessageCircle size={18} />
              </Link>
            </div>

            <Link to="/donate" className="btn-secondary text-sm">
              <Heart size={18} />
              Donate Now
            </Link>

            {user.isLoggedIn ? (
              <div className="flex items-center gap-3 pl-3 border-l border-primary-700">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User avatar"}
                    className="w-9 h-9 rounded-full object-cover border-2 border-gold-500"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full font-semibold flex items-center justify-center text-cosmic-deep"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffd700 0%, #fef3c7 100%)",
                    }}
                  >
                    {userInitials}
                  </div>
                )}
                <div className="flex flex-col text-xs leading-tight">
                  <span className="font-semibold text-white">
                    {user.name || "Logged in"}
                  </span>
                  <span className="text-primary-300">
                    {user.email || "Welcome back"}
                  </span>
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-400">
                      <Shield size={12} /> Admin
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="inline-flex items-center gap-1 text-primary-300 hover:text-gold-400 text-xs font-medium transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-primary-200 hover:text-gold-400 transition-colors"
                >
                  <User size={16} className="inline mr-2" />
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-gold-400 hover:bg-gold-500 text-primary-950 text-sm font-bold rounded-lg transition-colors shadow-lg shadow-gold-900/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-primary-200 hover:text-gold-400 hover:bg-primary-800/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-primary-700 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-primary-800/50 text-gold-400"
                      : "text-primary-200 hover:bg-primary-800/30 hover:text-gold-400"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/donate"
                onClick={() => setIsOpen(false)}
                className="btn-secondary mt-4 mx-4"
              >
                <Heart size={18} />
                Donate Now
              </Link>

              {user.isLoggedIn ? (
                <div className="mx-4 mt-2 p-4 rounded-lg border border-primary-700 bg-primary-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "User avatar"}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gold-500"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full font-semibold flex items-center justify-center text-cosmic-deep"
                        style={{
                          background:
                            "linear-gradient(135deg, #ffd700 0%, #fef3c7 100%)",
                        }}
                      >
                        {userInitials}
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-semibold text-white">
                        {user.name || "Logged in"}
                      </p>
                      <p className="text-primary-300">
                        {user.email || "Welcome back"}
                      </p>
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-400">
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
                    className="text-xs font-medium text-primary-300 hover:text-gold-400 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mx-4 mt-2 flex flex-col gap-3">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-lg font-semibold text-center border border-primary-600 text-primary-200 hover:border-gold-500 hover:text-gold-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-lg font-semibold text-center bg-gold-400 text-primary-950 hover:bg-gold-500 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
