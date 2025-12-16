'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/config/constants';
import Footer from '@/components/Footer';

// Modal type constants to prevent typos
const MODAL_TYPES = {
  CONTACT: 'contact',
  FEEDBACK: 'feedback',
  BUG: 'bug'
};

export default function ContactPage() {
  const [activeModal, setActiveModal] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const hasUnsavedChanges = () => {
    return formData.name || formData.email || formData.subject || formData.message;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    setError('');
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
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
        setSuccessEmail(formData.email);
        setShowSuccess(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        setTimeout(() => {
          setShowSuccess(false);
          setActiveModal(null);
          setSuccessEmail('');
        }, 7000);
      } else {
        const errorData = await response.json();
        
        // Handle field-specific validation errors
        if (errorData.detail && typeof errorData.detail === 'object') {
          setFieldErrors(errorData.detail);
        } else if (Array.isArray(errorData.detail)) {
          // Handle validation errors array
          const errors = {};
          errorData.detail.forEach(err => {
            if (err.loc && err.loc.length > 0) {
              const field = err.loc[err.loc.length - 1];
              errors[field] = err.msg;
            }
          });
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          } else {
            setError(errorData.detail[0]?.msg || 'Failed to send message. Please try again.');
          }
        } else {
          setError(errorData.detail || 'Failed to send message. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmClose(true);
    } else {
      setActiveModal(null);
      setError('');
      setFieldErrors({});
      setShowConfirmClose(false);
    }
  };

  const getModalTitle = () => {
    if (activeModal === MODAL_TYPES.CONTACT) return 'Contact us';
    if (activeModal === MODAL_TYPES.FEEDBACK) return 'Share your feedback';
    if (activeModal === MODAL_TYPES.BUG) return 'Report a bug';
    return '';
  };

  const getModalDescription = () => {
    if (activeModal === MODAL_TYPES.CONTACT) return 'Get in touch with our support team.';
    if (activeModal === MODAL_TYPES.FEEDBACK) return 'Help us improve by sharing your thoughts.';
    if (activeModal === MODAL_TYPES.BUG) return 'Report errors or bugs to the team.';
    return '';
  };

  const getMessagePlaceholder = () => {
    if (activeModal === MODAL_TYPES.CONTACT) return 'How can we help?';
    if (activeModal === MODAL_TYPES.FEEDBACK) return 'Tell us how we can improve...';
    if (activeModal === MODAL_TYPES.BUG) return 'Describe the issue in a few sentences...';
    return '';
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
              onClick={() => setActiveModal(MODAL_TYPES.CONTACT)}
              className="w-full bg-swapcircle-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
            >
              Contact us
            </button>
          </div>

          {/* Card 2: Leave feedback */}
          <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition cursor-pointer">
            <h3 className="text-2xl font-serif mb-3 text-black">Leave feedback</h3>
            <p className="text-gray-700 mb-6 text-sm leading-relaxed">Your feedback is valuable to us. Share your ideas to help us improve our products and services.</p>
            <button
              onClick={() => setActiveModal(MODAL_TYPES.FEEDBACK)}
              className="w-full bg-swapcircle-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
            >
              Share feedback
            </button>
          </div>

          {/* Card 3: Report a bug */}
          <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition cursor-pointer">
            <h3 className="text-2xl font-serif mb-3 text-black">Report a bug</h3>
            <p className="text-gray-700 mb-6 text-sm leading-relaxed">Notice something that's not quite right? Report errors or bugs to our team and we will get it fixed as soon as possible!</p>
            <button
              onClick={() => setActiveModal(MODAL_TYPES.BUG)}
              className="w-full bg-swapcircle-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
            >
              Report bug
            </button>
          </div>
        </div>
      </div>

      {/* ========== CONTACT FORM MODAL ========== */}
      {activeModal && !showSuccess && (
        <>
          {/* Blur Background - Only clickable when NOT loading */}
          <div 
            className={`fixed inset-0 backdrop-blur-sm z-40 ${!loading ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={() => !loading && handleCloseModal()}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg pointer-events-auto">
              <button
                onClick={handleCloseModal}
                disabled={loading}
                aria-label="Close modal"
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                ×
              </button>

              <h2 className="text-2xl font-serif mb-2 text-black">
                {getModalTitle()}
              </h2>
              <div className="w-12 h-1 bg-swapcircle-primary mb-4"></div>
              <p className="text-gray-700 mb-6 text-sm">
                {getModalDescription()}
              </p>

              {/* General Error Message Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-sm text-gray-900 placeholder-gray-500 transition hover:border-swapcircle-primary hover:shadow-sm ${
                      fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-sm text-gray-900 placeholder-gray-500 transition hover:border-swapcircle-primary hover:shadow-sm ${
                      fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Subject"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary text-sm text-gray-900 placeholder-gray-500 transition hover:border-swapcircle-primary hover:shadow-sm ${
                      fieldErrors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.subject && <p className="text-red-600 text-xs mt-1">{fieldErrors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={getMessagePlaceholder()}
                    required
                    rows="4"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-swapcircle-primary resize-none text-sm text-gray-900 placeholder-gray-500 transition hover:border-swapcircle-primary hover:shadow-sm ${
                      fieldErrors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.message && <p className="text-red-600 text-xs mt-1">{fieldErrors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-swapcircle-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </div>

            {/* Unsaved Changes Confirmation Modal */}
            {showConfirmClose && (
              <>
                <div className="fixed inset-0 backdrop-blur-sm z-50" />
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg pointer-events-auto">
                    <h3 className="text-lg font-serif text-black mb-3">Discard changes?</h3>
                    <p className="text-gray-700 text-sm mb-6">You have unsaved changes. Are you sure you want to close?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowConfirmClose(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
                      >
                        Keep editing
                      </button>
                      <button
                        onClick={() => {
                          setActiveModal(null);
                          setFormData({ name: '', email: '', subject: '', message: '' });
                          setError('');
                          setFieldErrors({});
                          setShowConfirmClose(false);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition cursor-pointer"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ========== SUCCESS MODAL ========== */}
      {showSuccess && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-sm z-40 cursor-pointer"
            onClick={() => setShowSuccess(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg pointer-events-auto text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-swapcircle-primary rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

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