import { useState } from "react";
import {
  Heart,
  AlertCircle,
  CheckCircle,
  Loader2,
  Smartphone,
} from "lucide-react";

interface DonationFormProps {
  variant?: "default" | "compact" | "hero";
}

export const DonationForm = ({ variant = "default" }: DonationFormProps) => {
  const [amount, setAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "ecocash" | "bank"
  >("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const presetAmounts = [10, 25, 50, 100, 250];
  const finalAmount = customAmount
    ? parseFloat(customAmount)
    : parseFloat(amount);

  // Impact calculations
  const getImpactText = (amt: number) => {
    if (amt >= 250)
      return `Sponsor a youth's complete 3-month recovery program`;
    if (amt >= 100)
      return `Provide 1 month of life skills training for a youth`;
    if (amt >= 50) return `Cover counseling sessions for 2 weeks`;
    if (amt >= 25) return `Provide meals and accommodation for 1 week`;
    if (amt >= 10) return `Supply educational materials for 1 youth`;
    return `Every dollar helps save a life`;
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!finalAmount || finalAmount <= 0) {
        throw new Error("Please enter a valid donation amount");
      }

      if (!donorEmail) {
        throw new Error("Please enter your email address");
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(donorEmail)) {
        throw new Error("Please enter a valid email address");
      }

      // Call backend to create payment intent
      const response = await fetch("/api/donations/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100), // Convert to cents
          currency: "usd",
          donorEmail,
          donorName,
          recurring,
          paymentMethod,
          purpose: "general_donation",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to process donation. Please try again.",
        );
      }

      const data = await response.json();

      // Handle different payment methods
      if (paymentMethod === "card") {
        // Redirect to Stripe checkout or show card input
        window.location.href = data.checkoutUrl;
      } else if (paymentMethod === "ecocash") {
        // Show Ecocash instructions
        window.location.href = `/donate/ecocash?ref=${data.reference}`;
      } else {
        // Show bank transfer details
        window.location.href = `/donate/bank?ref=${data.reference}`;
      }

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Thank You!</h2>
        <p className="text-gray-600 mb-6">
          Your generous donation of ${finalAmount} will help transform lives. A
          confirmation has been sent to your email.
        </p>
        <button onClick={() => setSuccess(false)} className="btn-primary">
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
        variant === "compact" ? "p-6" : "p-8"
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Make a Donation</h2>
        </div>
        <p className="text-gray-600">
          Your support helps youth overcome addiction and rebuild their lives.
        </p>
      </div>

      <form onSubmit={handleDonate} className="space-y-6">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Amount (USD)
          </label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmount(preset.toString());
                  setCustomAmount("");
                }}
                className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                  amount === preset.toString() && !customAmount
                    ? "border-primary-600 bg-primary-50 text-primary-600"
                    : "border-gray-200 hover:border-primary-300 text-gray-700"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount("");
              }}
              placeholder="Enter custom amount"
              min="1"
              className="input-field pl-8"
            />
          </div>
        </div>

        {/* Impact Statement */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 rounded-xl p-4">
          <p className="text-sm font-medium text-primary-800">
            💡 Your Impact: {getImpactText(finalAmount || 0)}
          </p>
        </div>

        {/* Payment Method - Zimbabwe specific */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                paymentMethod === "card"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300"
              }`}
            >
              <span className="text-2xl">💳</span>
              <span className="text-sm font-medium">Card</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("ecocash")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                paymentMethod === "ecocash"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300"
              }`}
            >
              <Smartphone className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">EcoCash</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("bank")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                paymentMethod === "bank"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300"
              }`}
            >
              <span className="text-2xl">🏦</span>
              <span className="text-sm font-medium">Bank</span>
            </button>
          </div>
        </div>

        {/* Recurring Donation */}
        <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="font-medium text-gray-900">
              Make this a monthly donation
            </span>
            <p className="text-sm text-gray-500">
              Help us plan ahead with consistent support
            </p>
          </div>
        </label>

        {/* Donor Info */}
        <div className="space-y-4">
          <input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Your name (optional)"
            className="input-field"
          />
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            placeholder="Your email *"
            required
            className="input-field"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 text-red-600 bg-red-50 p-4 rounded-xl">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !finalAmount || finalAmount <= 0}
          className="w-full btn-primary py-4 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart size={20} />
              Donate ${finalAmount || 0} {recurring && "/month"}
            </>
          )}
        </button>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 pt-4 border-t">
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            Secure Payment
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            Tax Deductible
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            100% to Manake
          </span>
        </div>
      </form>
    </div>
  );
};
