import { useEffect, useState } from 'react';
import { userAPI } from '@/services/api';

// Manages favorite status for a product, keeping API calls out of the component UI layer.
export function useFavoriteStatus(productId, user, isAuthenticated) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  // Initial favorite state
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!isAuthenticated || !user || !productId) {
        setIsFavorited(false);
        return;
      }

      try {
        const response = await userAPI.getFavorites(user.id);
        const favoriteIds = response.favorites || [];
        setIsFavorited(favoriteIds.includes(productId));
      } catch (error) {
        console.error('Error checking favorite status:', error);
        setIsFavorited(false);
      }
    };

    fetchFavoriteStatus();
  }, [isAuthenticated, user, productId]);

  const toggleFavorite = async () => {
    if (!isAuthenticated || !user || !productId) {
      throw new Error('Unauthorized: user must be logged in to favorite items');
    }
    if (isUpdatingFavorite) return { skipped: true };

    const nextFavoriteState = !isFavorited;
    setIsFavorited(nextFavoriteState);
    setIsUpdatingFavorite(true);

    try {
      if (nextFavoriteState) {
        await userAPI.addFavorite(user.id, productId);
        return { success: true, action: 'added' };
      }

      await userAPI.removeFavorite(user.id, productId);
      return { success: true, action: 'removed' };
    } catch (error) {
      // Revert optimistic update on failure
      setIsFavorited(!nextFavoriteState);
      throw error;
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  return {
    isFavorited,
    isUpdatingFavorite,
    toggleFavorite,
  };
}
