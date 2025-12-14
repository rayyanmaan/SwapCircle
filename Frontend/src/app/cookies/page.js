'use client';

import Footer from '@/components/Footer';

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-swapcircle-blue text-sm uppercase tracking-wide mb-4 font-semibold">POLICIES</p>
          <h1 className="text-6xl font-serif mb-6 text-black">Cookie Policy</h1>
          <p className="text-gray-700 text-lg">Last Updated: December 12, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <div className="prose prose-lg max-w-none">
          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6">What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files stored on your device when you visit our website or app. They help us remember your preferences, keep you logged in, and improve your experience on SwapCircle.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">How SwapCircle Uses Cookies</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Essential Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">These cookies are necessary for SwapCircle to function properly:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-6">
              <li><strong>Session Management:</strong> Keep you logged in across pages</li>
              <li><strong>Security:</strong> Detect and prevent fraudulent activity</li>
              <li><strong>Load Balancing:</strong> Ensure the platform runs smoothly</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Functional Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">These improve your experience by remembering your preferences:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-6">
              <li><strong>Language & Preferences:</strong> Remember your selected language and display settings</li>
              <li><strong>User Settings:</strong> Save your notification preferences and filter choices</li>
              <li><strong>Device Recognition:</strong> Remember which device you're using</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Analytics Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">We use these to understand how users interact with SwapCircle:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-6">
              <li><strong>Google Analytics:</strong> Track pages visited, time spent, and user flow</li>
              <li><strong>Firebase Analytics:</strong> Understand feature usage and user behavior</li>
              <li><strong>Heatmaps:</strong> See which areas of the page receive the most attention</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Marketing & Advertising Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">We use these to show you relevant ads and measure campaign effectiveness:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li><strong>Facebook Pixel:</strong> Track conversions and show personalized ads</li>
              <li><strong>Google Ads:</strong> Remarketing to users who visited SwapCircle</li>
              <li><strong>Analytics Partners:</strong> Track campaign performance across platforms</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">How to Control Cookies</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Browser Controls</h3>
            <p className="text-gray-700 leading-relaxed mb-3">Most browsers allow you to manage cookies through settings:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 mb-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage website data</li>
              <li><strong>Edge:</strong> Settings → Privacy → Cookies and other site data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">You can accept all cookies, reject all, or accept only essential cookies.</p>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Third-Party Opt-Outs</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li><strong>Digital Advertising Alliance:</strong> Visit www.aboutads.info/choices to opt out of interest-based ads</li>
              <li><strong>Google Ads Settings:</strong> Manage personalized ads at myadcenter.google.com</li>
              <li><strong>Facebook Ad Preferences:</strong> Adjust targeting at facebook.com/ads/preferences</li>
              <li><strong>Your Device:</strong> Most devices have app-tracking opt-out settings</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">Impact of Disabling Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">If you disable cookies, you may experience:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 mb-4">
              <li>Inability to stay logged in</li>
              <li>Loss of saved preferences</li>
              <li>Reduced personalization</li>
              <li>Some features may not work properly</li>
            </ul>
            <p className="text-gray-700 leading-relaxed"><strong>Note:</strong> Essential cookies cannot be disabled without breaking core functionality.</p>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">If you have questions about our use of cookies, please contact us:</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> support@swapcircle.com</p>
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