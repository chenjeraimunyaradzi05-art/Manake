import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Compass, 
  Heart, 
  MessageCircle,
  Share2,
  Shield, 
  Info, 
  Mail, 
  LogOut, 
  User,
  PlusSquare,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Home", path: "/", icon: <Home size={24} /> },
    { name: "Stories", path: "/stories", icon: <Sparkles size={24} /> },
    { name: "Programs", path: "/programs", icon: <Compass size={24} /> },
    { name: "Social", path: "/social", icon: <Share2 size={24} /> },
    { name: "Messaging", path: "/messages", icon: <MessageCircle size={24} /> },
    { name: "Get Help", path: "/get-help", icon: <Shield size={24} /> },
    { name: "About", path: "/about", icon: <Info size={24} /> },
    { name: "Contact", path: "/contact", icon: <Mail size={24} /> },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

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

  return (
    <aside className="hidden md:flex flex-col w-56 h-[calc(100vh-64px)] sticky top-[64px] border-r border-primary-200/20 bg-white/50 backdrop-blur-xl z-40 pt-8 pb-5 px-3">
      {/* Navigation Links - Now acting as quick shortcuts since Header exists */}
      <nav className="flex-grow flex flex-col gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 group ${
              isActive(link.path)
                ? "bg-primary-50 text-cosmic-900 font-bold"
                : "text-cosmic-700 hover:bg-primary-50/50 hover:text-cosmic-900"
            }`}
          >
            <span className={`transition-transform duration-300 ${isActive(link.path) ? "scale-110 text-gold-500" : "group-hover:scale-110 group-hover:text-gold-500"}`}>
              {link.icon}
            </span>
            <span className="text-base">{link.name}</span>
          </Link>
        ))}

        {/* Create/Donate Button */}
        <Link 
          to="/story/create" 
          className="mt-2 flex items-center gap-4 p-3 rounded-lg text-cosmic-700 hover:bg-primary-50 hover:text-cosmic-900 transition-colors group"
        >
           <PlusSquare size={24} className="group-hover:text-gold-500 transition-colors" />
           <span className="text-base">Create</span>
        </Link>

        {/* Create/Donate Button */}
        <Link 
          to="/donate" 
          className="mt-2 flex items-center gap-4 p-3 rounded-lg text-rose-600 hover:bg-rose-50 transition-all font-semibold"
        >
           <Heart size={24} className="fill-rose-600 animate-pulse" />
           <span>Donate Layout</span>
        </Link>
      </nav>

      {/* User Section (Bottom) */}
      <div className="mt-auto pt-4 border-t border-primary-100">
        {user.isLoggedIn ? (
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors group">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User avatar"}
                className="w-8 h-8 rounded-full object-cover border-2 border-gold-500"
              />
            ) : (
              <div className="w-8 h-8 rounded-full font-semibold flex items-center justify-center text-cosmic-deep text-xs" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #fef3c7 100%)' }}>
                {userInitials}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm text-cosmic-900 truncate group-hover:text-primary-700">
                {user.name || "My Profile"}
              </span>
              <span className="text-xs text-primary-400 truncate">
                {user.email}
              </span>
            </div>
            <button 
               onClick={() => logout()}
               className="ml-auto p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
               title="Log out"
            >
               <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link 
            to="/auth/login"
            className="flex items-center gap-4 p-3 rounded-lg text-cosmic-700 hover:bg-primary-50 hover:text-cosmic-900 transition-colors"
          >
            <User size={24} />
            <span className="font-semibold">Log in</span>
          </Link>
        )}
      </div>
      
      {/* Mobile-like More Menu (optional) */}
      <button className="flex items-center gap-4 p-3 rounded-lg text-cosmic-700 hover:bg-primary-50 mt-2">
        <MenuIcon />
        <span>More</span>
      </button>
    </aside>
  );
};

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
