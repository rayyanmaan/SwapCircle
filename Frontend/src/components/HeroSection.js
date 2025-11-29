export default function HeroSection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-swapcircle-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Main Headline - Script Font */}
            <h1 className="heading-script text-4xl md:text-5xl lg:text-6xl mb-6">
              The best way to swap clothes on campus.
            </h1>
            
            {/* Sub-headline */}
            <p className="text-lg md:text-xl mb-8 text-swapcircle-secondary leading-relaxed">
              Exchange your wardrobe with other students. No money, just credits.
            </p>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/browse" className="btn-primary">
                Swap now
              </a>
              <a href="/upload" className="btn-secondary">
                List an item
              </a>
            </div>

            {/* Trust Indicators / Stats */}
            <div className="mt-8 md:mt-12 flex flex-wrap gap-6 md:gap-8 justify-center lg:justify-start">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-swapcircle-primary">500+</div>
                <div className="text-xs md:text-sm text-swapcircle-tertiary">Active Swappers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-swapcircle-primary">1,200+</div>
                <div className="text-xs md:text-sm text-swapcircle-tertiary">Items Swapped</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-swapcircle-primary">4.8★</div>
                <div className="text-xs md:text-sm text-swapcircle-tertiary">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-swapcircle-alt shadow-lg">
              {/* Placeholder for hero image/illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-swapcircle-primary/10 flex items-center justify-center">
                    <svg 
                      className="w-16 h-16 icon-primary" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="1.5" 
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
                      />
                    </svg>
                  </div>
                  <p className="text-swapcircle-tertiary text-sm">
                    Visual placeholder for product showcase
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-swapcircle-credit/30 blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-swapcircle-primary/20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

