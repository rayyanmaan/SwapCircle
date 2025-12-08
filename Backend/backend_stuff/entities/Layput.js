import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);

  useEffect(() => {
    loadUser();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Trigger logo animation on mount
    setTimeout(() => setLogoAnimated(true), 2500);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log("User not logged in");
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl("Home"));
  };

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    if (currentPageName !== "Home") {
      navigate(createPageUrl("Home"));
      setTimeout(() => {
        const element = document.getElementById('how-it-works');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const isActive = (pageName) => {
    return currentPageName === pageName;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .font-serif {
          font-family: 'Instrument Serif', serif;
        }

        @keyframes elasticBounceLeft {
          0% {
            transform: translate(-50%, -50%) translateX(-80px);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) translateX(-3px);
            opacity: 1;
          }
        }

        @keyframes elasticBounceRight {
          0% {
            transform: translate(-50%, -50%) translateX(80px);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) translateX(3px);
            opacity: 1;
          }
        }

        @keyframes fadeInLogo {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .logo-circle-left {
          animation: elasticBounceLeft 2s cubic-bezier(0.68, -0.6, 0.32, 1.6) forwards;
        }

        .logo-circle-right {
          animation: elasticBounceRight 2s cubic-bezier(0.68, -0.6, 0.32, 1.6) forwards;
        }

        .logo-text {
          animation: fadeInLogo 0.5s ease-in-out 1.8s forwards;
          opacity: 0;
        }

        .logo-animated .logo-circle-left,
        .logo-animated .logo-circle-right,
        .logo-animated .logo-text {
          animation: none;
          opacity: 1;
        }

        .logo-animated .logo-circle-left {
          transform: translate(-50%, -50%) translateX(-3px);
        }

        .logo-animated .logo-circle-right {
          transform: translate(-50%, -50%) translateX(3px);
        }
      `}</style>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/98 backdrop-blur-sm shadow-sm' : 'bg-white/95 backdrop-blur-sm'
        } border-b border-gray-100`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className={`flex items-center gap-3 group ${logoAnimated ? 'logo-animated' : ''}`}>
              <div className="relative w-10 h-10">
                <div 
                  className="logo-circle-left absolute w-6 h-6 rounded-full border-[3px] border-[#2563EB] top-1/2 left-1/2 transition-transform group-hover:scale-110"
                />
                <div 
                  className="logo-circle-right absolute w-6 h-6 rounded-full border-[3px] border-black top-1/2 left-1/2 transition-transform group-hover:scale-110"
                />
              </div>
              <span className="logo-text font-serif text-2xl italic font-normal text-black transition-opacity group-hover:opacity-60">
                SwapCircle
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to={createPageUrl("Browse")} 
                className={`text-sm font-medium transition-all ${
                  isActive("Browse") ? 'text-black' : 'text-gray-600 hover:text-black'
                }`}
              >
                Browse
              </Link>
              <a 
                href="#how-it-works" 
                onClick={scrollToHowItWorks}
                className="text-sm font-medium text-gray-600 hover:text-black transition-all cursor-pointer"
              >
                How it works
              </a>
              
              {user ? (
                <>
                  <Link 
                    to={createPageUrl("Profile")} 
                    className={`text-sm font-medium transition-all ${
                      isActive("Profile") ? 'text-black' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Profile
                  </Link>
                  <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm font-semibold text-blue-700">
                      {user.credits || 0} credits
                    </span>
                  </div>
                  <Link to={createPageUrl("Upload")}>
                    <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg px-6 font-medium transition-all hover:scale-105">
                      List Item
                    </Button>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-black transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link to={createPageUrl("Login")}>
                    <Button variant="ghost" className="rounded-lg hover:bg-gray-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Register")}>
                    <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg px-6 font-medium transition-all hover:scale-105">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden transition-all hover:opacity-60"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-6 space-y-4">
                <Link 
                  to={createPageUrl("Browse")} 
                  className="block text-sm font-medium text-gray-900 hover:text-black transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                <a
                  href="#how-it-works"
                  onClick={(e) => { scrollToHowItWorks(e); setMobileMenuOpen(false); }}
                  className="block text-sm font-medium text-gray-900 hover:text-black transition-all cursor-pointer"
                >
                  How it works
                </a>
                {user ? (
                  <>
                    <Link 
                      to={createPageUrl("Profile")} 
                      className="block text-sm font-medium text-gray-900 hover:text-black transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100 w-fit">
                      <span className="text-sm font-semibold text-blue-700">
                        {user.credits || 0} credits
                      </span>
                    </div>
                    <Link to={createPageUrl("Upload")} onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg">
                        List Item
                      </Button>
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="w-full text-left text-sm font-medium text-gray-900"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to={createPageUrl("Login")} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Sign In</Button>
                    </Link>
                    <Link to={createPageUrl("Register")} onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-50 mt-24 overflow-hidden border-t border-gray-100">
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.03] pointer-events-none select-none">
          <div className="font-serif text-[20rem] md:text-[35rem] italic font-normal text-black leading-none whitespace-nowrap">
            swap
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-8 h-8">
                  <div className="absolute w-5 h-5 rounded-full border-[2.5px] border-[#2563EB] top-1/2 left-1/2" style={{ transform: 'translate(-65%, -50%)' }} />
                  <div className="absolute w-5 h-5 rounded-full border-[2.5px] border-black top-1/2 left-1/2" style={{ transform: 'translate(-35%, -50%)' }} />
                </div>
                <span className="font-serif text-xl italic">SwapCircle</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                The best way for college students to swap clothes and keep fashion circular.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-black mb-4 text-sm">Shop</h3>
              <div className="space-y-3">
                <Link to={createPageUrl("Browse")} className="block text-sm text-gray-600 hover:text-black transition-all">
                  Browse All
                </Link>
                <a href="#" className="block text-sm text-gray-600 hover:text-black transition-all">Categories</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-black mb-4 text-sm">Help</h3>
              <div className="space-y-3">
                <a href="#how-it-works" onClick={scrollToHowItWorks} className="block text-sm text-gray-600 hover:text-black transition-all cursor-pointer">
                  How It Works
                </a>
                <a href="#" className="block text-sm text-gray-600 hover:text-black transition-all">FAQ</a>
                <a href="#" className="block text-sm text-gray-600 hover:text-black transition-all">Contact</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2024 SwapCircle. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-black transition-all">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-black transition-all">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}