'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [activeModal, setActiveModal] = useState(null); // 'contact' | 'feedback' | 'bug' | null
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState(''); // Store email for success modal
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          type: activeModal
        })
      });

      if (response.ok) {
        // Store email before clearing form
        setSuccessEmail(formData.email);
        
        // Show success modal
        setShowSuccess(true);
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        // Close success modal after 7 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setActiveModal(null);
          setSuccessEmail('');
        }, 7000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto mb-16">
          <p className="text-swapcircle-blue text-sm uppercase tracking-wide mb-4 font-semibold">CONTACT & SUPPORT</p>
          <h1 className="text-6xl font-serif mb-6 text-black">Questions? We have answers</h1>
          <p className="text-gray-700 text-lg">We're here to help. Reach out for support or share your feedback to help us enhance your experience.</p>
        </div>

        {/* 3 Card Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Contact our team */}
          <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition cursor-pointer">
            <h3 className="text-2xl font-serif mb-3 text-black">Contact our team</h3>
            <p className="text-gray-700 mb-6 text-sm leading-relaxed">Need assistance or have a question? Get in touch with our team for support.</p>
            <button
              onClick={() => setActiveModal('contact')}
              className="w-full bg-swapcircle-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Contact us
            </button>
          </div>

          {/* Card 2: Leave feedback */}
          <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition cursor-pointer">
            <h3 className="text-2xl font-serif mb-3 text-black">Leave feedback</h3>
            <p className="text-gray-700 mb-6 text-sm leading-relaxed">Your feedback is valuable to us. Share your ideas to help us improve our products and services.</p>
            <button
              onClick={() => setActiveModal('feedback')}
              className="w-full bg-swapcircle-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Share feedback
            </button>
          </div>

          {/* Card 3: Report a bug */}
          <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition cursor-pointer">
            <h3 className="text-2xl font-serif mb-3 text-black">Report a bug</h3>
            <p className="text-gray-700 mb-6 text-sm leading-relaxed">Notice something that's not quite right? Report errors or bugs to our team and we will get it fixed as soon as possible!</p>
            <button
              onClick={() => setActiveModal('bug')}
              className="w-full bg-swapcircle-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Report bug
            </button>
          </div>
        </div>
      </div>

      {/* ========== CONTACT FORM MODAL ========== */}
      {activeModal && !showSuccess && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-sm z-40"
            onClick={() => setActiveModal(null)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg pointer-events-auto">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>

              <h2 className="text-2xl font-serif mb-2 text-black">
                {activeModal === 'contact' && 'Contact us'}
                {activeModal === 'feedback' && 'Share your feedback'}
                {activeModal === 'bug' && 'Report a bug'}
              </h2>
              <div className="w-12 h-1 bg-swapcircle-primary mb-4"></div>
              <p className="text-gray-700 mb-6 text-sm">
                {activeModal === 'contact' && 'Get in touch with our support team.'}
                {activeModal === 'feedback' && 'Help us improve by sharing your thoughts.'}
                {activeModal === 'bug' && 'Report errors or bugs to the team.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-sm text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-sm text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-sm text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={
                      activeModal === 'contact' ? 'How can we help?' :
                      activeModal === 'feedback' ? 'Tell us how we can improve...' :
                      'Describe the issue in a few sentences...'
                    }
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary resize-none text-sm text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Submit Button with Hand Cursor */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-swapcircle-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ========== SUCCESS MODAL ========== */}
      {showSuccess && (
        <>
          {/* Blur Background - Clickable to Close */}
          <div 
            className="fixed inset-0 backdrop-blur-sm z-40 cursor-pointer"
            onClick={() => setShowSuccess(false)}
          />
          
          {/* Success Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg pointer-events-auto text-center">
              {/* Checkmark Icon */}
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-swapcircle-primary rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <h3 className="text-2xl font-serif text-black mb-3">Submitted!</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Thanks for reaching out. We've received your message and will get back to you soon. A confirmation email has been sent to <span className="font-semibold">{successEmail}</span>.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <Footer />
    </main>
  );
}