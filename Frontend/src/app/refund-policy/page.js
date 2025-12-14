'use client';

import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-swapcircle-blue text-sm uppercase tracking-wide mb-4 font-semibold">POLICIES</p>
          <h1 className="text-6xl font-serif mb-6 text-black">Refund & Returns Policy</h1>
          <p className="text-gray-700 text-lg">Last Updated: December 12, 2025</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6">Important: SwapCircle is a P2P Platform</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              SwapCircle is a peer-to-peer clothing swap platform, not a traditional e-commerce retailer. Users exchange items directly with each other. <strong>SwapCircle does not own, handle, or ship items.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed">
              This policy explains how refunds and returns work in our swap-based ecosystem.
            </p>
          </section>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">1. Swap Disputes & Item Condition Issues</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">If You Receive an Item in Poor Condition</h3>
            <p className="text-gray-700 leading-relaxed mb-4">If the item you received doesn't match the agreed description or is damaged:</p>
            
            <p className="font-semibold text-black mb-3">Within 7 Days of Receiving:</p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-2 mb-4">
              <li>Document the issue with clear photos/videos</li>
              <li>Contact the sender through SwapCircle messaging</li>
              <li>Attempt to resolve directly (request a replacement item or reverse the swap)</li>
              <li>If no resolution, contact our support team at support@swapcircle.com</li>
            </ol>

            <p className="font-semibold text-black mb-3">Support Team Review:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 mb-4">
              <li>We will review messages, photos, and item descriptions</li>
              <li>We may request additional evidence from both parties</li>
              <li>We mediate but cannot force the other user to refund or replace</li>
              <li>If fraud is detected, we may take action against the user</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">Damaged Items During Shipping</h3>
            <p className="text-gray-700 leading-relaxed mb-3">If an item arrives damaged due to shipping issues:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Contact the sender immediately with evidence</li>
              <li>Discuss compensation (either a replacement item or other resolution)</li>
              <li>If the sender refuses to help, our team can assist with mediation</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4"><strong>Note:</strong> SwapCircle is not responsible for shipping damage. The swapping parties are responsible for packaging items safely.</p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">2. Platform Fee Refunds</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">When You'll Receive a Refund</h3>
            <p className="text-gray-700 leading-relaxed mb-4"><strong>SwapCircle platform fees are non-refundable</strong> in most cases, except:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 mb-6">
              <li><strong>Swap Cancellation Before Shipment:</strong> If both parties cancel before either ships items, fees may be refunded at our discretion</li>
              <li><strong>System Error:</strong> If a technical glitch caused duplicate charges</li>
              <li><strong>Refund by Law:</strong> When legally required (e.g., CCPA/GDPR requests)</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">How Refunds Are Processed</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Refund requests must be submitted within <strong>30 days</strong> of the charge</li>
              <li>Processing time: 5-10 business days back to original payment method</li>
              <li>Contact support@swapcircle.com with order details</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">3. If You're Accused of Misrepresenting an Item</h2>
            <p className="text-gray-700 leading-relaxed mb-4">If another user claims the item you sent doesn't match your description:</p>
            
            <p className="font-semibold text-black mb-3">Our Process:</p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-2 mb-4">
              <li>We review the item listing and photos you provided</li>
              <li>We review messages between you and the other user</li>
              <li>We request evidence from both parties</li>
              <li>We make a determination based on available evidence</li>
            </ol>

            <p className="font-semibold text-black mb-3">If Found at Fault:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>We may ask you to accept the item back (reverse swap)</li>
              <li>We may ask you to provide a replacement item</li>
              <li>Repeat offenses may result in account suspension</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">4. Preventing Issues: Best Practices</h2>
            
            <h3 className="text-xl font-semibold text-black mb-4 mt-6">As a Sender</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 mb-6">
              <li><strong>Accurate Descriptions:</strong> Be honest about condition, size, fit, and any flaws</li>
              <li><strong>Clear Photos:</strong> Show the front, back, and any damage or stains</li>
              <li><strong>Message Details:</strong> Confirm size, color, and condition with the receiver</li>
              <li><strong>Safe Shipping:</strong> Package securely to prevent damage in transit</li>
              <li><strong>Insurance:</strong> Consider shipping insurance for valuable items</li>
              <li><strong>Tracking:</strong> Always use tracked shipping so you have proof of delivery</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4 mt-6">As a Receiver</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li><strong>Review Listing:</strong> Check photos and description carefully before accepting</li>
              <li><strong>Ask Questions:</strong> Message the sender about condition before committing</li>
              <li><strong>Inspect Immediately:</strong> Open the package promptly and inspect the item</li>
              <li><strong>Document:</strong> If there's an issue, take photos/videos before contacting the sender</li>
              <li><strong>Be Reasonable:</strong> Normal wear and slight variations are expected with used items</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">5. What SwapCircle is NOT Responsible For</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We cannot refund or replace items for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li><strong>Personal Preferences:</strong> You changed your mind about the item</li>
              <li><strong>Size/Fit Issues:</strong> The item doesn't fit as expected</li>
              <li><strong>Shipping Delays:</strong> Packages taking longer than expected</li>
              <li><strong>Carrier Issues:</strong> Lost packages (contact shipping carrier directly)</li>
              <li><strong>Minor Wear:</strong> Normal signs of use on secondhand clothing</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif text-black mb-6 mt-12 pt-6 border-t border-gray-200">6. Contact Our Support Team</h2>
            <p className="text-gray-700 leading-relaxed mb-4">If you have a swap dispute, need a refund, or have questions:</p>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700"><strong>Email:</strong> support@swapcircle.com</p>
              <p className="text-gray-700 mt-2"><strong>Response Time:</strong> Within 48 business hours</p>
            </div>

            <p className="font-semibold text-black mb-3">Please include:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Swap order number or username of other party</li>
              <li>Clear description of the issue</li>
              <li>Photos/screenshots as evidence</li>
              <li>What resolution you're requesting</li>
            </ul>
          </section>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-sm">© 2025 SwapCircle. All rights reserved.</p>
            <p className="text-gray-600 text-sm mt-2">For our full Terms of Service, visit the <a href="/terms" className="text-swapcircle-blue hover:underline">Terms of Service page</a></p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}