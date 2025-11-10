'use client';

import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function ProductDetail({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Sample product data - replace with actual props
  const sampleProduct = {
    id: 1,
    title: 'Padded Denim Bomber',
    condition: 'Like New',
    brand: 'ZARA',
    size: 'M',
    description: 'Beautiful padded denim bomber jacket in excellent condition. Perfect for layering. No stains or damage. Worn only a few times.',
    credits: 2,
    userCredits: 8,
    images: [
      '/api/placeholder/800/1000',
      '/api/placeholder/800/1000',
      '/api/placeholder/800/1000',
    ],
    seller: {
      name: 'Alex Chen',
      avatar: '/api/placeholder/100/100',
      credits: 12,
      lockDuration: '48 hours',
    },
  };

  const productData = product || sampleProduct;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productData.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productData.images.length) % productData.images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf2f8' }}>
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-4" style={{ backgroundColor: '#fdf2f8' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, #fbcfe8, #fce7f3)' }}></div>
              
              {/* Navigation Arrows */}
              {productData.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9333ea' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9333ea' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {productData.images.length > 1 && (
              <div className="flex space-x-2">
                {productData.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-1 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? '' : 'opacity-50'
                    }`}
                    style={{ 
                      borderColor: index === currentImageIndex ? '#9333ea' : 'transparent',
                      backgroundColor: '#fdf2f8'
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-400"></div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-4xl font-bold" style={{ color: '#1e1b4b' }}>
              {productData.title}
            </h1>

            {/* Attributes */}
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                {productData.condition}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>
                Brand: {productData.brand}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                Size: {productData.size}
              </span>
            </div>

            {/* About Section */}
            <div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#1e1b4b' }}>About this item</h2>
              <p className="text-base leading-relaxed" style={{ color: '#7c3aed' }}>
                {productData.description}
              </p>
            </div>

            {/* Credits Section */}
            <div className="border-2 rounded-lg p-6" style={{ borderColor: '#fbcfe8' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1e1b4b' }}>Cost to acquire:</h3>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm" style={{ color: '#7c3aed' }}>
                  You have {productData.userCredits} credits available
                </p>
                <p className="text-4xl font-bold" style={{ color: '#9333ea' }}>
                  {productData.credits} Credits
                </p>
              </div>
              <button className="w-full py-4 text-white rounded-lg font-semibold text-lg transition-colors hover:opacity-90" style={{ backgroundColor: '#9333ea' }}>
                Swap Now
              </button>
            </div>

            {/* Seller Section */}
            <div className="border-2 rounded-lg p-6" style={{ borderColor: '#fbcfe8' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1e1b4b' }}>Seller</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-400"></div>
                <div>
                  <p className="text-lg font-semibold" style={{ color: '#1e1b4b' }}>{productData.seller.name}</p>
                  <p className="text-sm" style={{ color: '#7c3aed' }}>
                    {productData.seller.credits} credits • {productData.seller.lockDuration} lock
                  </p>
                </div>
              </div>
              <button className="w-full py-3 border-2 rounded-lg font-medium transition-colors hover:opacity-70" style={{ 
                borderColor: '#9333ea', 
                color: '#9333ea',
                backgroundColor: 'transparent'
              }}>
                💬 Message Seller
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex-1 py-3 border-2 rounded-lg font-medium transition-colors hover:opacity-70 flex items-center justify-center space-x-2" style={{ 
                borderColor: '#fbcfe8',
                color: '#9333ea'
              }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Save</span>
              </button>
              <button className="flex-1 py-3 border-2 rounded-lg font-medium transition-colors hover:opacity-70 flex items-center justify-center space-x-2" style={{ 
                borderColor: '#fbcfe8',
                color: '#9333ea'
              }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              <button className="flex-1 py-3 border-2 rounded-lg font-medium transition-colors hover:opacity-70 flex items-center justify-center space-x-2" style={{ 
                borderColor: '#fbcfe8',
                color: '#9333ea'
              }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

