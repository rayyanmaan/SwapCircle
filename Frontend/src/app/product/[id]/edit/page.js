'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditItemForm from '@/components/EditItemForm';
import { itemsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const itemId = params?.id;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) {
        setError('Item ID is required');
        setLoading(false);
        return;
      }

      if (!isAuthenticated || !user) {
        setError('You must be logged in to edit items');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await itemsAPI.getItem(itemId);
        
        // Check if user is the owner
        if (data.owner_id && data.owner_id !== user.id) {
          setUnauthorized(true);
          setError('You can only edit your own items');
          setLoading(false);
          return;
        }

        setItem(data);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError(err.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, isAuthenticated, user]);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-swapcircle-white">
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-swapcircle-secondary">Loading item...</p>
          </div>
          <Footer />
        </main>
      </ProtectedRoute>
    );
  }

  if (error || unauthorized) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-swapcircle-white">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Unauthorized'}</p>
              <button 
                onClick={() => router.push(itemId ? `/product/${itemId}` : '/browse')}
                className="btn-primary"
              >
                {itemId ? 'Back to Item' : 'Back to Browse'}
              </button>
            </div>
          </div>
          <Footer />
        </main>
      </ProtectedRoute>
    );
  }

  if (!item) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-swapcircle-white">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-swapcircle-secondary mb-4">Item not found</p>
              <button 
                onClick={() => router.push('/browse')}
                className="btn-primary"
              >
                Back to Browse
              </button>
            </div>
          </div>
          <Footer />
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-swapcircle-white">
        <EditItemForm itemId={itemId} initialItem={item} />
        <Footer />
      </main>
    </ProtectedRoute>
  );
}

