'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const [showShippingModal, setShowShippingModal] = useState(false);

  // Scroll to section on homepage
  const scrollToSection = (sectionId) => {
    if (typeof window === 'undefined') return;

    const isHomepage = window.location.pathname === '/' || window.location.pathname === '';
    
    if (!isHomepage) {
      // Not on homepage, navigate to home with hash
      window.location.href = `/#${sectionId}`;
      return;
    }

    // We're on homepage, scroll to section
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      console.log('Looking for element:', sectionId);
      console.log('Found element:', element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <footer className="bg-swapcircle-white border-t border-swapcircle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content - Logo Left, Columns Right */}
          <div className="flex flex-col md:flex-row md:justify-between mb-12">
            {/* Left Side - Brand */}
            <div className="mb-8 md:mb-0 md:flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <Logo showText={false} />
                <h3 className="text-2xl font-serif italic font-bold text-black">
                  SwapCircle
                </h3>
              </div>
              <p className="text-sm text-swapcircle-secondary max-w-xs">
                The best way for college students to swap clothes and keep fashion circular.
              </p>
            </div>

            {/* Right Side - Columns */}
            <div className="flex gap-16">
              {/* Shop Column */}
              <div>
                <h4 className="heading-primary text-sm font-semibold mb-4 text-black">
                  Shop
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/browse" 
                      className="text-sm link-swapcircle text-swapcircle-secondary hover:underline"
                      aria-label="Browse all items"
                    >
                      Browse All
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Help Column */}
              <div>
                <h4 className="heading-primary text-sm font-semibold mb-4 text-black">
                  Help
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => scrollToSection('how-it-works')}
                      className="text-sm link-swapcircle text-swapcircle-secondary hover:underline cursor-pointer bg-none border-none p-0"
                      aria-label="Learn how SwapCircle works"
                    >
                      How It Works
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setShowShippingModal(true)}
                      className="text-sm link-swapcircle text-swapcircle-secondary hover:underline cursor-pointer bg-none border-none p-0"
                      aria-label="View shipping and returns information"
                    >
                      Shipping & Returns
                    </button>
                  </li>
                  <li>
                    <Link 
                      href="/contact" 
                      className="text-sm link-swapcircle text-swapcircle-secondary hover:underline"
                      aria-label="Contact SwapCircle support"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-swapcircle-tertiary text-sm">
                © {new Date().getFullYear()} SwapCircle. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link 
                  href="/privacy" 
                  className="text-sm link-swapcircle text-swapcircle-secondary hover:underline"
                  aria-label="Read our privacy policy"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="text-sm link-swapcircle text-swapcircle-secondary hover:underline"
                  aria-label="Read our terms of service"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/cookies" 
                  className="text-sm link-swapcircle text-swapcircle-secondary hover:underline"
                  aria-label="Read our cookie policy"
                >
                  Cookie Policy
                </Link>
                <Link 
                  href="/refund-policy" 
                  className="text-sm link-swapcircle text-swapcircle-secondary hover:underline"
                  aria-label="Read our refund and returns policy"
                >
                  Refund & Returns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ========== SHIPPING & RETURNS MODAL ========== */}
      {showShippingModal && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-sm z-40 cursor-pointer"
            onClick={() => setShowShippingModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg pointer-events-auto">
              <h2 className="text-2xl font-serif font-bold mb-4 text-swapcircle-blue">
                Shipping & Returns
              </h2>
              <p className="text-swapcircle-secondary mb-6 leading-relaxed">
                Kindly note that SwapCircle is not responsible for shipping and returns. This is only a swap between the two parties. 
                You will handle your own shipping and request for return directly to the person 
                you rented an item from.
              </p>
              <p className="text-swapcircle-secondary mb-6 leading-relaxed">
                For more information, please visit our <Link 
                  href="/refund-policy" 
                  className="text-swapcircle-blue text-sm font-semibold hover:underline"
                  aria-label="Read our refund and returns policy"
                >
                  Refund & Returns Policy
                </Link>.
              </p>
              <button
                onClick={() => setShowShippingModal(false)}
                className="w-full bg-swapcircle-primary text-white py-2 rounded-lg hover:opacity-90 transition cursor-pointer"
                aria-label="Close shipping and returns modal"
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}