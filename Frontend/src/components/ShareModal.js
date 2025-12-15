'use client';

import { useEffect } from 'react';

export default function ShareModal({ isOpen, onClose, itemTitle, itemUrl }) {
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const url = itemUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const text = `Check this out on SwapCircle: ${itemTitle}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onClose({ copied: true });
    } catch (_) {
      onClose({ copied: false });
    }
  };

  const webShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SwapCircle', text, url });
        onClose({ shared: true });
      }
    } catch (_) {
      onClose({ shared: false });
    }
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
  const mailto = `mailto:?subject=${encodeURIComponent('SwapCircle: ' + itemTitle)}&body=${encodeURIComponent(text + '\n' + url)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="heading-primary text-xl font-bold mb-4">Share Item</h2>
        <div className="space-y-3">
          {typeof navigator !== 'undefined' && navigator.share && (
            <button onClick={webShare} className="btn-primary w-full py-2">Share via…</button>
          )}
          <button onClick={copyLink} className="btn-secondary w-full py-2">Copy link</button>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-center py-2">Share on WhatsApp</a>
          <a href={mailto} className="btn-secondary w-full text-center py-2">Share via Email</a>
        </div>
        <button onClick={onClose} className="mt-4 w-full btn-secondary py-2">Close</button>
      </div>
    </div>
  );
}
