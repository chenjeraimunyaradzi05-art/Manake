import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Unused import removed

export const RightSidebar = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  // Mock suggested stories or users
  const suggestions = [
    { id: 1, name: "Maria's Recovery", label: "Featured Story", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" },
    { id: 2, name: "Community Garden", label: "New Program", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=100" },
    { id: 3, name: "Emergency Fund", label: "Urgent Need", img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=100" },
    { id: 4, name: "Youth Support", label: "Popular", img: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=100" }
  ];

  return (
    <aside className="w-full pr-4 pl-4 pt-8">
      {/* User Switcher / Profile Preview */}
      {user.isLoggedIn && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             {user.avatar ? (
                <img src={user.avatar} alt="User" className="w-12 h-12 rounded-full border border-gray-200" />
             ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center text-cosmic-deep font-bold">
                  {user.name?.[0] || "M"}
                </div>
             )}
             <div className="flex flex-col">
               <span className="font-bold text-sm text-cosmic-900">{user.name}</span>
               <span className="text-secondary-400 text-xs">{user.email}</span>
             </div>
          </div>
          <button className="text-xs font-bold text-primary-500 hover:text-primary-700">Switch</button>
        </div>
      )}

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-500">Suggested for you</span>
        <button className="text-xs font-bold text-cosmic-900 hover:text-primary-500">See All</button>
      </div>

      {/* Suggestions List */}
      <div className="flex flex-col gap-4 mb-8">
        {suggestions.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={item.img} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-cosmic-900">{item.name}</span>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            </div>
            <Link to={`/story/${item.id}`} className="text-xs font-bold text-primary-500 hover:text-primary-700">Follow</Link>
          </div>
        ))}
      </div>

      {/* Footer Links (Mini) */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 mb-4">
        {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Locations', 'Language'].map((link) => (
          <Link key={link} to="#" className="text-xs text-gray-400 hover:underline">
            {link}
          </Link>
        ))}
      </div>

      <div className="text-xs text-gray-400 uppercase">
        © {currentYear} Manake Rehabilitation Center
      </div>
      
      {/* Emergency Quick Access */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200">
        <h4 className="font-bold text-rose-800 text-sm mb-2">Need Immediate Help?</h4>
        <p className="text-xs text-rose-700 mb-3">Our helpline is available 24/7 for emergencies.</p>
        <Link to="/get-help" className="flex items-center justify-center w-full py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-sm">
           Get Support
        </Link>
      </div>
    </aside>
  );
};
