import { Link } from "react-router-dom";
import {
  MessageCircle,
  Users,
  Mail,
  Phone,
  MapPin,
  Heart,
  ExternalLink,
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Success Stories", path: "/stories" },
    { name: "Our Programs", path: "/programs" },
    { name: "Products", path: "/products" },
    { name: "Our Team", path: "/team" },
    { name: "Social", path: "/social" },
    { name: "Messaging", path: "/messages" },
    { name: "Get Help", path: "/get-help" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const supportLinks = [
    { name: "Donate", path: "/donate" },
    { name: "Volunteer", path: "/volunteer" },
    { name: "Partner With Us", path: "/partner" },
    { name: "Fundraise", path: "/fundraise" },
  ];

  return (
    <footer style={{ background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b69 100%)' }}>
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-diamond-glow" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #d4a000 100%)' }}>
                <span className="text-cosmic-deep font-bold text-xl">M</span>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-gold-400 group-hover:text-gold-300 transition-colors block">
                  Manake
                </span>
                <span className="text-sm text-primary-300">
                  Rehabilitation Center
                </span>
              </div>
            </Link>
            <p className="text-primary-300 mb-6 leading-relaxed">
              Transforming lives through recovery, education, and hope.
              Empowering Zimbabwe's youth to overcome addiction and build
              brighter futures.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <Link
                to="/social"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-primary-300 hover:text-cosmic-deep" 
                style={{ background: 'rgba(107, 76, 154, 0.3)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #ffd700 0%, #fef3c7 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(107, 76, 154, 0.3)'}
                aria-label="Manake Social"
                title="Manake Social"
              >
                <Users size={18} />
              </Link>
              <Link
                to="/messages"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-primary-300 hover:text-cosmic-deep"
                style={{ background: 'rgba(107, 76, 154, 0.3)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #ffd700 0%, #fef3c7 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(107, 76, 154, 0.3)'}
                aria-label="Messaging"
                title="Messaging"
              >
                <MessageCircle size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-gold-400 text-lg mb-6 flex items-center gap-2">
              <span className="text-gold-500">◆</span> Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-primary-300 hover:text-gold-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-gold-400 text-lg mb-6 flex items-center gap-2">
              <span className="text-gold-500">◆</span> Support Us
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-primary-300 hover:text-gold-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link to="/donate" className="btn-secondary text-sm">
                <Heart size={16} />
                Donate Today
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-bold text-gold-400 text-lg mb-6 flex items-center gap-2">
              <span className="text-gold-500">◆</span> Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="text-gold-500 flex-shrink-0 mt-1"
                />
                <span className="text-primary-300">
                  123 Hope Street, Harare,
                  <br />
                  Zimbabwe
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-gold-500 flex-shrink-0" />
                <a
                  href="tel:+263775772277"
                  className="text-primary-300 hover:text-gold-400 transition-colors"
                >
                  +263 77 577 2277
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-gold-500 flex-shrink-0" />
                <a
                  href="mailto:info@manake.org.zw"
                  className="text-primary-300 hover:text-gold-400 transition-colors"
                >
                  info@manake.org.zw
                </a>
              </li>
            </ul>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/263776123456?text=Hello%20Manake%2C%20I%20need%20help"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #50c878 0%, #2d7a5a 100%)' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-400">
              © {currentYear} Manake Rehabilitation Center. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-primary-400">
              <Link
                to="/privacy"
                className="hover:text-gold-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-gold-400 transition-colors">
                Terms of Service
              </Link>
              <a
                href="/sitemap.xml"
                className="hover:text-gold-400 transition-colors inline-flex items-center gap-1"
              >
                Sitemap <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
