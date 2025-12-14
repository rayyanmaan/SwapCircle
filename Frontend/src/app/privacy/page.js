'use client';

import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-swapcircle-blue text-sm uppercase tracking-wide mb-4 font-semibold">POLICIES</p>
          <h1 className="text-6xl font-serif mb-6 text-black">Privacy Policy</h1>
          <p className="text-gray-700 text-lg">Last Updated: December 12, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed mb-4">
              SwapCircle ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and other online services (collectively, our "Services").
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services. By accessing or using SwapCircle, you acknowledge that you have read, understood, and agree to be bound by all the provisions of this Privacy Policy.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>For users in Argentina:</strong> SwapCircle complies with Argentina's Ley de Protección de Datos Personales (LPPD). See Section 12 for Argentina-specific rights.
            </p>
          </section>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-8">Information You Provide Directly</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-black mb-2">Account Registration</h4>
              <p className="text-gray-700 leading-relaxed mb-3">When you create a SwapCircle account, we collect information such as:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number (optional)</li>
                <li>Date of birth</li>
                <li>Profile picture</li>
                <li>Clothing size preferences</li>
                <li>City of residence (required for browsing and listing items)</li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-black mb-2">Clothing Items Listed</h4>
              <p className="text-gray-700 leading-relaxed mb-3">When you list items for swap, we collect:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                <li>Item photos (multiple images per listing)</li>
                <li>Item title, description, and condition</li>
                <li>Clothing size</li>
                <li>Item category/type</li>
                <li>Special notes or care instructions</li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-black mb-2">Swap Communications & Requests</h4>
              <p className="text-gray-700 leading-relaxed">When you interact with other users, we collect swap requests, message content, photos, attachments, and request status information.</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-black mb-2">Ratings & Feedback</h4>
              <p className="text-gray-700 leading-relaxed">When you complete a swap, we collect your rating of the other user, written feedback, and ratings you receive from other users.</p>
            </div>

            <h3 className="text-xl font-semibold text-black mb-4 mt-8">Information We Collect Automatically</h3>
            <p className="text-gray-700 leading-relaxed mb-4">We automatically collect device information, usage data, cookies, and transaction information to improve your experience and prevent fraud.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-8">Information from Third Parties</h3>
            <p className="text-gray-700 leading-relaxed">If you sign up via Google, Apple, or Facebook, we receive your name, email, and profile picture. Other users may also provide information about you through ratings and reports.</p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Provide core services (create accounts, facilitate swaps, list items)</li>
              <li>Suggest items and users based on your preferences</li>
              <li>Display your completed swap count and ratings for community trust</li>
              <li>Send transactional emails and notifications</li>
              <li>Personalize your feed and experience</li>
              <li>Detect fraud and prevent abuse</li>
              <li>Comply with legal requirements</li>
              <li>Send marketing communications (optional)</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Show relevant ads on third-party platforms</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">3. How We Share Your Information</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">To Facilitate Swaps</h3>
            <p className="text-gray-700 leading-relaxed mb-6">When you initiate a swap, we share your basic profile information, contact information, and item details with the other user to complete the transaction.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Public Profile & User Discovery</h3>
            <p className="text-gray-700 leading-relaxed mb-6">Your profile is publicly searchable. This includes your username, profile picture, completed swap count, ratings, bio, and all listed items.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Service Providers</h3>
            <p className="text-gray-700 leading-relaxed mb-6">We share information with vendors like Google Firebase, MongoDB, Google Analytics, and email service providers who help us operate SwapCircle.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed mb-6">We may disclose information if required by law or to protect against fraud, security threats, or physical harm.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Aggregated & Anonymized Data</h3>
            <p className="text-gray-700 leading-relaxed">We may share aggregated data that cannot identify you personally, such as usage trends and demographic statistics.</p>
          </section>

          {/* Section 4 - Data Security */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">4. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We implement industry-standard security measures including encryption, secure password storage, and regular security audits.</p>
            <p className="text-gray-700 leading-relaxed">However, no security method is 100% secure. If you believe your account has been compromised, contact us immediately at support@swapcircle.com.</p>
          </section>

          {/* Section 5 - Your Privacy Choices */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">5. Your Privacy Choices</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Account Access & Deletion</h3>
            <p className="text-gray-700 leading-relaxed mb-4">You can update or delete your account anytime by logging in and visiting Settings, or by contacting support@swapcircle.com.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Cookies & Tracking</h3>
            <p className="text-gray-700 leading-relaxed mb-4">You can control cookies through your browser settings. Disabling cookies may affect some features of SwapCircle.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Marketing Communications</h3>
            <p className="text-gray-700 leading-relaxed">To opt out of promotional emails, click "Unsubscribe" at the bottom of marketing emails or adjust notification settings in your account preferences.</p>
          </section>

          {/* Section 6 - Argentina LPPD */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">6. Argentina-Specific Privacy Rights (LPPD)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">SwapCircle complies with Argentina's Ley de Protección de Datos Personales. You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 mb-4">
              <li><strong>Access (Habeas Data):</strong> Request what personal data we hold about you</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Deletion (Right to be Forgotten):</strong> Request deletion of your data</li>
              <li><strong>Non-Discrimination:</strong> We will not discriminate for exercising privacy rights</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">To exercise these rights, email support@swapcircle.com with "LPPD Request" in the subject line. We will respond within 10 business days.</p>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">If you have questions about this Privacy Policy, please contact us:</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> support@swapcircle.com</p>
              <p className="text-gray-700"><strong>Via App:</strong> Settings → Contact Support</p>
              <p className="text-gray-700 mt-3"><strong>Mailing Address:</strong><br />SwapCircle<br />Privacy Team<br />Minerva University<br />Buenos Aires, Argentina</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">We will respond to your privacy inquiries within 30 days (or 10 business days for LPPD requests).</p>
          </section>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-sm">© 2025 SwapCircle. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}