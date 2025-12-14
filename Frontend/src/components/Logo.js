'use client';
export default function Logo({ className = '', showText = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Two overlapping circles */}
      <div className="relative flex items-center">
        {/* Left Circle (Primary Blue - #0046B0) */}
        <div
          className="relative w-7 h-7 rounded-full border-3 border-swapcircle-primary -mr-2 z-10"
        />
        
        {/* Right Circle (Almost Black - #0F0F0F) */}
        <div
          className="relative w-7 h-7 rounded-full border-3 -ml-2 z-0"
          style={{ borderColor: '#0F0F0F' }}
        />
      </div>
      
      {/* SwapCircle text - EB Garamond Italic */}
      {showText && (
        <span 
          className="text-xl font-serif italic font-bold text-black"
        >
          SwapCircle
        </span>
      )}
    </div>
  );
}