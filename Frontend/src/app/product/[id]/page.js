'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { itemsAPI } from '@/services/api';

export default function ProductPage() {
  const params = useParams();
  const itemId = params?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!itemId) {
        setError('Item ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await itemsAPI.getItem(itemId);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [itemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-swapcircle-white flex items-center justify-center">
        <p className="text-swapcircle-secondary">Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-swapcircle-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/browse" className="btn-primary">Back to Browse</a>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}

