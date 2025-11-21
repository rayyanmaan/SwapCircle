'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * GuestRoute component - redirects authenticated users to /browse
 * Only shows content to unauthenticated users (for landing/homepage)
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/browse');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-swapcircle-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-swapcircle-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-swapcircle-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

