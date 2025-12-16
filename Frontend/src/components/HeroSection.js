export default function HeroSection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-swapcircle-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Headline - Script Font */}
        <h1 className="heading-script text-4xl md:text-5xl lg:text-6xl mb-6">
          The best way to swap clothes on campus.
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg md:text-xl mb-8 text-swapcircle-secondary leading-relaxed">
          Exchange your wardrobe with other students. No money, just credits.
        </p>
        
        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:mb-12">
          <a href="/browse" className="btn-primary">
            Swap now
          </a>
          <a href="/upload" className="btn-secondary">
            List an item
          </a>
        </div>

        {/* Trust Indicators / Stats */}
        <div className="flex flex-wrap gap-6 md:gap-8 justify-center">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-swapcircle-primary">500+</div>
            <div className="text-xs md:text-sm text-swapcircle-tertiary">Active Swappers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-swapcircle-primary">1,200+</div>
            <div className="text-xs md:text-sm text-swapcircle-tertiary">Items Swapped</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-swapcircle-primary">4.8★</div>
            <div className="text-xs md:text-sm text-swapcircle-tertiary">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}