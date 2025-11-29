'use client';

export default function Logo({ className = '', showText = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Two overlapping circles matching SwapSuccessModal design */}
      <div className="relative flex items-center">
        {/* Left Circle (Blue) */}
        <div
          className="relative w-9 h-9 rounded-full border-4 border-swapcircle-primary -mr-2 z-10"
        />
        
        {/* Right Circle (Black) */}
        <div
          className="relative w-9 h-9 rounded-full border-4 -ml-2 z-0"
          style={{ borderColor: '#000000' }}
        />
      </div>
      {/* SwapCircle text */}
      {showText && (
        <span 
          className="text-xl font-semibold"
          style={{ color: '#000000' }}
        >
          SwapCircle
        </span>
      )}
    </div>
  );
}

