export default function HeroSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[600px]">
      {/* Browse Clothes Section */}
      <div className="relative overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 opacity-90" style={{
          background: 'linear-gradient(to bottom right, #ff006e, #ec4899, #8b5cf6)'
        }}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <h2 className="text-5xl font-bold mb-6">Browse</h2>
          <button className="px-8 py-4 bg-white rounded-full font-semibold hover:bg-gray-100 transition-colors" style={{ color: '#9333ea' }}>
            Shop now
          </button>
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: '#9333ea' }}></div>
      </div>

      {/* List Your Clothes Section */}
      <div className="relative overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 opacity-90" style={{
          background: 'linear-gradient(to bottom right, #fbbf24, #f97316, #ff006e)'
        }}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <h2 className="text-5xl font-bold mb-6">List</h2>
          <button className="px-8 py-4 bg-white rounded-full font-semibold hover:bg-gray-100 transition-colors" style={{ color: '#9333ea' }}>
            Sell now
          </button>
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: '#9333ea' }}></div>
      </div>
    </section>
  );
}

