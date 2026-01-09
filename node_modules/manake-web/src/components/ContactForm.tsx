import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  variant?: 'default' | 'compact';
  subject?: string;
}

export const ContactForm = ({ variant = 'default', subject }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: subject || '',
    message: '',
    type: 'general' // general, volunteer, partnership, media
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'inapp',
          direction: 'inbound',
          senderName: formData.name,
          senderEmail: formData.email,
          senderPhone: formData.phone,
          content: formData.message,
          contentType: 'text',
          metadata: {
            subject: formData.subject,
            type: formData.type,
          },
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again.');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-600 mb-4">
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="btn-primary"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Inquiry Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          I want to...
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="input-field"
        >
          <option value="general">Ask a general question</option>
          <option value="help">Get help for myself or someone</option>
          <option value="volunteer">Volunteer with Manake</option>
          <option value="partnership">Explore partnership opportunities</option>
          <option value="donate">Learn about donating</option>
          <option value="media">Media inquiry</option>
        </select>
      </div>

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
            className="input-field"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number (optional)
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+263 77 123 4567"
          className="input-field"
        />
      </div>

      {/* Subject */}
      {variant === 'default' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="What is this about?"
            className="input-field"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Message *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Tell us how we can help..."
          className="input-field resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex gap-3 text-red-600 bg-red-50 p-4 rounded-xl">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full md:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={18} />
            Send Message
          </>
        )}
      </button>

      {/* Privacy note */}
      <p className="text-xs text-gray-500">
        By submitting this form, you agree to our{' '}
        <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>.
        We'll never share your information with third parties.
      </p>
    </form>
  );
};
