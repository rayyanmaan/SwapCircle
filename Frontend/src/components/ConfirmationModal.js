'use client';

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'default' // 'default', 'danger'
}) {
  if (!isOpen) return null;

  const confirmButtonClass = variant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 text-white' 
    : 'btn-primary';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
        {/* Logo circles - match SwapProcessingModal style */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Left Circle (Primary Blue - #0046B0) */}
          <div className="relative w-7 h-7 rounded-full border-3 border-swapcircle-primary -mr-2 z-10" />
          
          {/* Right Circle (Almost Black - #0F0F0F) */}
          <div
            className="relative w-7 h-7 rounded-full border-3 -ml-2 z-0"
            style={{ borderColor: '#0F0F0F' }}
          />
        </div>

        {/* Title */}
        <h2 className="heading-primary text-xl font-bold text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-swapcircle-secondary text-center mb-8 text-sm leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn-secondary flex-1 py-2.5 disabled:opacity-50 transition-opacity"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${confirmButtonClass} flex-1 py-2.5 rounded-lg font-medium disabled:opacity-50 transition-opacity`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}