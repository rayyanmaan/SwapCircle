'use client';

import { useState } from 'react';
import Link from 'next/link';

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
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-2xl font-bold mb-4 text-swapcircle-blue">
                SwapCircle
              </h3>
              <p className="text-sm mb-4 text-swapcircle-secondary">
                The best way for college students to swap clothes and keep fashion circular.
              </p>
            </div>

          {/* Shop Column */}
          <div>
            <h4 className="heading-primary text-sm font-semibold mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm link-swapcircle text-swapcircle-secondary">
                  Browse All
                </a>
              </li>
              <li>
                <a href="#" className="text-sm link-swapcircle text-swapcircle-secondary">
                  Women's
                </a>
              </li>
              <li>
                <a href="#" className="text-sm link-swapcircle text-swapcircle-secondary">
                  Men's
                </a>
              </li>
              <li>
                <a href="#" className="text-sm link-swapcircle text-swapcircle-secondary">
                  Accessories
                </a>
              </li>
              <li>
                <a href="#" className="text-sm link-swapcircle text-swapcircle-secondary">
                  Trending Now
                </a>
              </li>
            </ul>
          </div>

            {/* Help Column */}
            <div>
              <h4 className="heading-primary text-sm font-semibold mb-4">
                Help
              </h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => scrollToSection('how-it-works')}
                    className="text-sm link-swapcircle text-swapcircle-secondary hover:underline cursor-pointer bg-none border-none p-0"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowShippingModal(true)}
                    className="text-sm link-swapcircle text-swapcircle-secondary hover:underline cursor-pointer bg-none border-none p-0"
                  >
                    Shipping & Returns
                  </button>
                </li>
                <li>
                  <Link href="/contact" className="text-sm link-swapcircle text-swapcircle-secondary hover:underline">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-swapcircle-tertiary text-sm">
                © {new Date().getFullYear()} SwapCircle. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm link-swapcircle text-swapcircle-secondary hover:underline">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm link-swapcircle text-swapcircle-secondary hover:underline">
                  Terms of Service
                </a>
                <a href="#" className="text-sm link-swapcircle text-swapcircle-secondary hover:underline">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ========== SHIPPING & RETURNS MODAL ========== */}
      {showShippingModal && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-sm z-40"
            onClick={() => setShowShippingModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg pointer-events-auto">
              <h2 className="text-2xl font-serif font-bold mb-3 text-swapcircle-blue">
                Shipping & Returns
              </h2>
              <p className="text-swapcircle-secondary mb-6 leading-relaxed">
                Kindly note that SwapCircle is not responsible for shipping and returns. This is only a swap between the two parties. 
                You will handle your own shipping and request for return directly to the person 
                you rented an item from.
              </p>
              <button
                onClick={() => setShowShippingModal(false)}
                className="w-full bg-swapcircle-primary text-white py-2 rounded-lg hover:opacity-90 transition"
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