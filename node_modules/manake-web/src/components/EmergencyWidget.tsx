import { Phone, MessageCircle } from 'lucide-react';

interface EmergencyWidgetProps {
  variant?: 'banner' | 'floating' | 'card';
}

export const EmergencyWidget = ({ variant = 'banner' }: EmergencyWidgetProps) => {
  const phoneNumber = '+263775772277';
  const whatsappUrl = `https://wa.me/263776123456?text=I%20need%20help%20urgently`;

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
  };

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
        </button>
        {/* Emergency Button */}
        <button
          onClick={handleCall}
          className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 animate-pulse"
          aria-label="Emergency Call"
        >
          <Phone className="w-6 h-6" />
        </button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">🆘</span>
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold mb-2">In Crisis? We're Here for You</h3>
            <p className="text-red-100 mb-4">
              24/7 confidential support available. You're not alone - reach out now.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCall}
                className="bg-white text-red-600 font-bold px-5 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Phone size={18} />
                Call Now
              </button>
              <button
                onClick={handleWhatsApp}
                className="bg-green-500 text-white font-bold px-5 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default banner variant
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 py-4">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">🆘</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Need Immediate Help?</h3>
              <p className="text-red-100 text-sm">24/7 confidential crisis support available</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCall}
              className="bg-white text-red-600 font-bold px-6 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Phone size={18} />
              +263 77 577 2277
            </button>
            <button
              onClick={handleWhatsApp}
              className="bg-green-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
