'use client';

import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-swapcircle-blue text-sm uppercase tracking-wide mb-4 font-semibold">POLICIES</p>
          <h1 className="text-6xl font-serif mb-6 text-black">Terms of Service</h1>
          <p className="text-gray-700 text-lg">Last Updated: December 12, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Service ("Terms") constitute a legal agreement between you ("User," "you," or "your") and SwapCircle ("we," "us," "our," or "Company"). By accessing or using SwapCircle's website, mobile application, and services (collectively, the "Services"), you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree to any part of these Terms, you may not use our Services.
            </p>
          </section>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">1. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We grant you a limited, non-exclusive, non-transferable license to use SwapCircle for personal, non-commercial purposes, subject to these Terms. You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Reproduce, duplicate, copy, or sell any portion of SwapCircle</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools (bots, scrapers) to collect data</li>
              <li>Engage in harassment, abuse, or threatening behavior</li>
              <li>Post prohibited, defamatory, or illegal content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Spam or send unsolicited messages</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">2. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">To use most features of SwapCircle, you must create an account. You agree to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 mb-6">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the confidentiality of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of unauthorized access</li>
              <li>Be at least 18 years old</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Account Termination</h3>
            <p className="text-gray-700 leading-relaxed">We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, fail to pay fees, or violate another user's rights. You may delete your account anytime through your account settings.</p>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">3. User Conduct & Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to use SwapCircle to:</p>
            
            <h3 className="text-lg font-semibold text-black mb-3 mt-6">Illegal Activities</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-4">
              <li>Engage in any illegal transaction or activity</li>
              <li>Sell stolen, counterfeit, or dangerous items</li>
              <li>Violate any local, state, national, or international law</li>
            </ul>

            <h3 className="text-lg font-semibold text-black mb-3 mt-6">Fraud & Deception</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-4">
              <li>Misrepresent the condition or authenticity of items</li>
              <li>Engage in scams or fraudulent schemes</li>
              <li>Create fake reviews or artificially inflate ratings</li>
            </ul>

            <h3 className="text-lg font-semibold text-black mb-3 mt-6">Harmful Content</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-4">
              <li>Post hate speech or threats</li>
              <li>Harass, bully, or intimidate other users</li>
              <li>Share inappropriate or offensive content</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">4. Acceptable Items for Swapping</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You may only list and swap items that are:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 mb-4">
              <li>Legal in your jurisdiction</li>
              <li>In your possession and ownership</li>
              <li>Not stolen, counterfeit, or inauthentic</li>
              <li>Safe and not prohibited</li>
              <li>Accurately described and photographed</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-3 font-semibold">Prohibited Items:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>Weapons, firearms, explosives</li>
              <li>Illegal drugs or controlled substances</li>
              <li>Hazardous materials</li>
              <li>Stolen property</li>
              <li>Counterfeit goods</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">5. Swaps & Transactions</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">How Swaps Work</h3>
            <p className="text-gray-700 leading-relaxed">Users post items they wish to swap, other users make offers, swappers negotiate terms, and items are exchanged based on agreed terms.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">User Responsibility</h3>
            <p className="text-gray-700 leading-relaxed mb-4"><strong>SwapCircle is a P2P platform.</strong> We facilitate connections but do not:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-4">
              <li>Guarantee item condition, authenticity, or safety</li>
              <li>Handle physical items or shipping</li>
              <li>Resolve disputes directly</li>
            </ul>
            <p className="text-gray-700 leading-relaxed"><strong>You are responsible for:</strong> Accurately describing items, inspecting before accepting, arranging safe shipping, communicating with partners, and resolving disputes.</p>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">6. Limitations of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4"><strong>SwapCircle is provided "AS IS" and "AS AVAILABLE."</strong> We disclaim all warranties, express or implied.</p>
            <p className="text-gray-700 leading-relaxed mb-4">We are not liable for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Lost, damaged, or stolen items during swaps</li>
              <li>Disputes between users</li>
              <li>Failure to complete swaps</li>
              <li>Service interruptions or technical issues</li>
              <li>Indirect or consequential damages</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4"><strong>Our total liability</strong> shall not exceed the amount you've paid to SwapCircle in the past 12 months (or $100, whichever is less).</p>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">7. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">SwapCircle's Role</h3>
            <p className="text-gray-700 leading-relaxed mb-4">As a P2P platform, SwapCircle does not take ownership of swapped items. We can assist with dispute mediation but cannot force refunds.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">User-to-User Disputes</h3>
            <p className="text-gray-700 leading-relaxed">If you have a dispute with another user:</p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-2">
              <li>Attempt to resolve directly through messaging</li>
              <li>Contact our support team with documentation</li>
              <li>We will review and provide guidance, but final resolution is between users</li>
            </ol>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">8. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">If you have questions about these Terms of Service, please contact us:</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> support@swapcircle.com</p>
              <p className="text-gray-700 mt-3"><strong>Mailing Address:</strong><br />SwapCircle<br />Legal Team<br />Minerva University<br />Buenos Aires, Argentina</p>
            </div>
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