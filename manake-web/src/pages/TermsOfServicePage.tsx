import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export const TermsOfServicePage = () => {
  return (
    <>
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-7 h-7 text-primary-200" />
            <h1 className="text-xl md:text-2xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-primary-100 max-w-2xl">
            By using the Manake Rehabilitation Center website and platform, you
            agree to the following terms and conditions.
          </p>
          <p className="text-primary-300 text-sm mt-3">
            Last updated: January 2026
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl prose prose-gray prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Manake Rehabilitation Center website
            ("Site") and any associated services ("Platform"), you agree to be
            bound by these Terms of Service ("Terms"). If you do not agree, do
            not use the Site or Platform.
          </p>

          <h2>2. About Manake</h2>
          <p>
            Manake Rehabilitation Center is a registered non-profit organisation
            in Zimbabwe providing youth drug and alcohol rehabilitation
            services, community programmes, and digital resources. Our
            registered contact is{" "}
            <a
              href="mailto:info@manake.org.zw"
              className="text-primary-600 underline"
            >
              info@manake.org.zw
            </a>
            .
          </p>

          <h2>3. Use of the Platform</h2>
          <p>
            You agree to use the Platform only for lawful purposes and in a way
            that does not:
          </p>
          <ul>
            <li>
              Infringe the rights of others or violate any applicable law.
            </li>
            <li>
              Post or share content that is abusive, harassing, defamatory, or
              harmful to minors.
            </li>
            <li>
              Impersonate any person or entity, or misrepresent your
              affiliation.
            </li>
            <li>
              Attempt to gain unauthorised access to any part of the Platform or
              its servers.
            </li>
            <li>Transmit spam, malware, or any other harmful code.</li>
          </ul>

          <h2>4. Accounts and Registration</h2>
          <p>
            To access certain features, you may need to create an account. You
            are responsible for maintaining the confidentiality of your
            credentials and for all activity under your account. You must notify
            us immediately at{" "}
            <a
              href="mailto:info@manake.org.zw"
              className="text-primary-600 underline"
            >
              info@manake.org.zw
            </a>{" "}
            of any unauthorised use.
          </p>
          <p>
            You must be at least 13 years old to create an account. Users under
            18 require parental or guardian consent.
          </p>

          <h2>5. Donations</h2>
          <p>
            Donations made through the Platform are processed securely via
            Stripe (card payments) or directly via EcoCash / bank transfer. All
            donations are voluntary and non-refundable unless an error occurred
            during processing. Manake is a registered non-profit and donation
            receipts are available upon request.
          </p>
          <p>
            We make every effort to apply donations to the programmes described.
            Manake reserves the right to direct funds to areas of greatest need
            where specific programme restrictions do not apply.
          </p>

          <h2>6. Community Platform</h2>
          <p>
            Our Platform includes community features such as stories, forums,
            and messaging. You retain ownership of content you post but grant
            Manake a non-exclusive licence to display it on the Platform. We
            reserve the right to remove content that violates these Terms or our
            community guidelines.
          </p>
          <p>
            The Platform is intended to support recovery and wellbeing. Content
            that glorifies substance use, violence, or self-harm is strictly
            prohibited and will be removed.
          </p>

          <h2>7. Disclaimer of Medical Advice</h2>
          <p>
            Content on this Site is for informational purposes only and does not
            constitute medical, psychological, or clinical advice. Always
            consult a qualified health professional for medical concerns. In an
            emergency, call our crisis line on{" "}
            <a href="tel:+263775772277" className="text-primary-600 underline">
              +263 77 577 2277
            </a>{" "}
            or go to your nearest emergency facility.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            All content on the Site — including text, images, logos, and
            software — is the property of Manake Rehabilitation Center or its
            licensors and is protected by Zimbabwean and international copyright
            law. You may not reproduce, distribute, or create derivative works
            without our written permission.
          </p>

          <h2>9. Third-Party Links</h2>
          <p>
            The Site may contain links to third-party websites. We do not
            endorse or control those sites and are not responsible for their
            content or privacy practices.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by Zimbabwean law, Manake is not
            liable for any indirect, incidental, or consequential damages
            arising from your use of the Site or Platform. Our total liability
            for any claim shall not exceed the amount you donated in the
            relevant transaction.
          </p>

          <h2>11. Changes to These Terms</h2>
          <p>
            We may update these Terms at any time. The "Last updated" date at
            the top will reflect changes. Continued use of the Platform after
            changes constitutes acceptance of the revised Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Zimbabwe. Any disputes shall
            be subject to the exclusive jurisdiction of the courts of Zimbabwe.
          </p>

          <div className="mt-10 p-6 bg-gray-50 rounded-2xl not-prose">
            <p className="text-gray-700">
              Questions about these Terms?{" "}
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
