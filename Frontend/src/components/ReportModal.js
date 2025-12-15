'use client';

import { useEffect, useState } from 'react';
import { reportAPI } from '@/services/api';

const REASONS = [
  { value: 'spam', label: 'Spam or misleading listing' },
  { value: 'inappropriate', label: 'Inappropriate or offensive content' },
  { value: 'prohibited', label: 'Prohibited item' },
  { value: 'fraud', label: 'Fraud or scam' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'other', label: 'Other' },
];

export default function ReportModal({ isOpen, onClose, targetType = 'item', targetId, itemUrl }) {
  const [reason, setReason] = useState('inappropriate');
  const [details, setDetails] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const submit = async () => {
    if (reason === 'other' && !otherReason.trim()) {
      setError('Please describe the issue.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const mergedDetails = reason === 'other'
        ? otherReason + (details ? `\n${details}` : '')
        : details;

      await reportAPI.submitReport({
        target_type: targetType,
        target_id: targetId,
        reason,
        details: mergedDetails || null,
        item_url: itemUrl,
      });
      onClose({ success: true });
    } catch (e) {
      setError(e.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="heading-primary text-xl font-bold mb-2">Report {targetType === 'item' ? 'Item' : 'User'}</h2>
        <p className="text-black text-sm mb-4">Tell us what's wrong. We'll review and take action.</p>
        {error && (
          <div className="mb-3 p-2 border border-red-200 rounded text-red-700 text-sm">{error}</div>
        )}
        <div className="space-y-3">
          <div>
            <p className="block text-sm text-black font-medium mb-2">Reason</p>
            <div className="space-y-2">
              {REASONS.map(r => (
                <label key={r.value} className="flex items-start gap-2 text-sm text-black cursor-pointer">
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e)=>setReason(e.target.value)}
                    className="mt-0.5"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          {reason === 'other' && (
            <div>
              <label className="block text-sm text-black font-medium mb-1">Describe the issue *</label>
              <input
                type="text"
                value={otherReason}
                onChange={(e)=>setOtherReason(e.target.value)}
                className="w-full px-3 py-2 border border-swapcircle rounded-lg bg-white text-black"
                placeholder="Tell us what's wrong"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-black font-medium mb-1">Additional details (optional)</label>
            <textarea className="w-full px-3 py-2 border border-swapcircle rounded-lg bg-white resize-none text-black" rows={4} value={details} onChange={(e)=>setDetails(e.target.value)} placeholder="Add context or links…"/>
          </div>
          <button onClick={submit} disabled={submitting} className="btn-primary w-full py-2 disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit Report'}</button>
          <button onClick={onClose} className="btn-secondary w-full py-2">Cancel</button>
        </div>
      </div>
    </div>
  );
}
