export default function ValueProposition() {
  return (
    <section id="how-it-works" className="section-swapcircle py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Title - Script Font */}
        <h2 className="heading-script text-5xl md:text-6xl mb-16">
          How it works
        </h2>
        
        {/* Three Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left">
          {/* Step 01 */}
          <div>
            <div className="heading-primary text-2xl font-semibold mb-3">
              01 List your clothes
            </div>
            <p className="text-swapcircle-secondary text-base">
              Upload photos of items you no longer wear.
            </p>
          </div>
          
          {/* Step 02 */}
          <div>
            <div className="heading-primary text-2xl font-semibold mb-3">
              02 Browse and discover
            </div>
            <p className="text-swapcircle-secondary text-base">
              Find pieces from other students on your campus.
            </p>
          </div>
          
          {/* Step 03 */}
          <div>
            <div className="heading-primary text-2xl font-semibold mb-3">
              03 Swap with credits
            </div>
            <p className="text-swapcircle-secondary text-base">
              Use your credits to claim items. Arrange pickup or delivery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

