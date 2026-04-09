import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export const PrivacyPolicyPage = () => {
  return (
    <>
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-7 h-7 text-primary-200" />
            <h1 className="text-xl md:text-2xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-primary-100 max-w-2xl">
            Manake Rehabilitation Center is committed to protecting your
            privacy. This policy explains how we collect, use, and safeguard
            your personal information.
          </p>
          <p className="text-primary-300 text-sm mt-3">
            Last updated: January 2026
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl prose prose-gray prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
          <h2>1. Who We Are</h2>
          <p>
            Manake Rehabilitation Center ("Manake", "we", "our") is a registered
            non-profit organisation based in Zimbabwe, dedicated to empowering
            youth to overcome drug and alcohol addiction. Our website is located
            at{" "}
            <a
              href="https://manake.org.zw"
              className="text-primary-600 underline"
            >
              manake.org.zw
            </a>
            .
          </p>
          <p>
            For questions about this policy, contact us at{" "}
            <a
              href="mailto:info@manake.org.zw"
              className="text-primary-600 underline"
            >
              info@manake.org.zw
            </a>
            .
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>
              <strong>Contact information:</strong> name, email address, phone
              number — when you submit a contact or help request form.
            </li>
            <li>
              <strong>Donation information:</strong> name, email, and payment
              method — when you make a donation. Card payments are processed
              securely by Stripe and we do not store your card details.
            </li>
            <li>
              <strong>Account information:</strong> name, email, and password
              (hashed) — if you create an account on our platform.
            </li>
            <li>
              <strong>Usage data:</strong> pages visited, browser type, and
              approximate location — collected automatically to improve the
              website.
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Respond to your enquiries and help requests.</li>
            <li>Process donations and issue receipts.</li>
            <li>Provide access to our online community platform.</li>
            <li>
              Send programme updates and impact reports (you may unsubscribe at
              any time).
            </li>
            <li>Improve our website and services.</li>
            <li>Comply with legal obligations under Zimbabwean law.</li>
          </ul>

          <h2>4. Sharing of Information</h2>
          <p>
            We do <strong>not</strong> sell, rent, or trade your personal
            information to third parties. We may share information with:
          </p>
          <ul>
            <li>
              <strong>Stripe</strong> — for secure payment processing. Stripe's
              privacy policy applies to payment data.
            </li>
            <li>
              <strong>Service providers</strong> — e.g. email delivery and
              hosting, under strict confidentiality agreements.
            </li>
            <li>
              <strong>Legal authorities</strong> — where required by Zimbabwean
              law or to protect the safety of individuals.
            </li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures including HTTPS
            encryption, secure password hashing, rate limiting, and access
            controls. However, no online transmission is 100% secure and we
            encourage you to keep your account credentials private.
          </p>

          <h2>6. Sensitive Information (Health & Recovery Data)</h2>
          <p>
            We treat any information related to health, mental wellbeing, or
            addiction recovery with the highest level of confidentiality. Such
            information is never shared without your explicit consent, except
            where required by law or to prevent imminent harm.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Unsubscribe from marketing emails at any time.</li>
          </ul>
          <p>
            To exercise these rights, email us at{" "}
            <a
              href="mailto:info@manake.org.zw"
              className="text-primary-600 underline"
            >
              info@manake.org.zw
            </a>
            .
          </p>

          <h2>8. Cookies</h2>
          <p>
            Our website may use essential cookies for authentication and session
            management. We do not use advertising or tracking cookies.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our platform serves youth aged 13 and above. For users under 18, we
            require parental or guardian consent before collecting personal
            information. We do not knowingly collect information from children
            under 13.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The "Last updated" date
            at the top of this page will reflect any changes. Continued use of
            our website after changes constitutes acceptance of the updated
            policy.
          </p>

          <div className="mt-10 p-6 bg-gray-50 rounded-2xl not-prose">
            <p className="text-gray-700">
              Questions or concerns?{" "}
              <Link
                to="/contact"
                className="text-primary-600 font-semibold hover:underline"
              >
                Contact us
              </Link>{" "}
              or email{" "}
              <a
                href="mailto:info@manake.org.zw"
                className="text-primary-600 font-semibold hover:underline"
              >
                info@manake.org.zw
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
