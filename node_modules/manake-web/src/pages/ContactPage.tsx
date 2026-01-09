import { ContactForm } from '../components/ContactForm';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export const ContactPage = () => {
  return (
    <>
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            Reach out for admissions, partnerships, volunteering, or media inquiries. We respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Send a Message</h2>
            <ContactForm />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-lg mb-3">Sign in quickly</h3>
              <SocialAuthButtons />
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-lg mb-3">Direct Contact</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3 items-start">
                  <Phone className="text-primary-600 w-5 h-5 mt-1" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <a href="tel:+263775772277" className="text-primary-700 hover:underline">+263 77 577 2277</a>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <MessageCircle className="text-green-600 w-5 h-5 mt-1" />
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <a href="https://wa.me/263775772277?text=Hello%20Manake" className="text-primary-700 hover:underline">Chat on WhatsApp</a>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <Mail className="text-primary-600 w-5 h-5 mt-1" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <a href="mailto:info@manake.org.zw" className="text-primary-700 hover:underline">info@manake.org.zw</a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-lg mb-3">Visit Us</h3>
              <div className="flex gap-3 items-start text-gray-700">
                <MapPin className="text-primary-600 w-5 h-5 mt-1" />
                <div>
                  123 Hope Street<br />
                  Harare, Zimbabwe
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-lg mb-3">Hours</h3>
              <div className="flex gap-3 items-start text-gray-700">
                <Clock className="text-primary-600 w-5 h-5 mt-1" />
                <div>
                  Intake & visits: Mon-Fri 8am - 5pm<br />
                  Crisis line: 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
