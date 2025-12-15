import { useEffect, useState } from 'react';
import { userAPI, itemsAPI } from '@/services/api';
import { getItemMetadata, getImageUrl } from '@/utils/itemParser';

// Fetch favorites for the authenticated user when enabled and the Favorites tab is active.
export function useFavorites({ enabled, userId, activeTab }) {
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!enabled || !userId || activeTab !== 'favorites') {
        return;
      }

      try {
        setLoadingFavorites(true);
        const response = await userAPI.getFavorites(userId);
        const favoriteIds = response.favorites || [];

        if (!favoriteIds || favoriteIds.length === 0) {
          setFavorites([]);
          return;
        }

        const favoriteItemsPromises = favoriteIds.map(async (itemId) => {
          try {
            return await itemsAPI.getItem(itemId);
          } catch (err) {
            console.error(`Error fetching favorite item ${itemId}:`, err);
            return null;
          }
        });

        const favoriteItems = (await Promise.all(favoriteItemsPromises)).filter(Boolean);

        const transformedFavorites = favoriteItems.map((item) => {
          const metadata = getItemMetadata(item);
          const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
          const imageUrl = firstImage ? getImageUrl(firstImage) : '/api/placeholder/300';

          return {
            id: item.id,
            title: item.title,
            size: metadata.size || 'Size M',
            credits: metadata.credits || 2,
            condition: metadata.condition || 'Good',
            timestamp: 'Recently',
            image: imageUrl,
            status: item.status || 'available',
            showSwappedStatus: true,
          };
        });

        setFavorites(transformedFavorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setFavorites([]);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [enabled, userId, activeTab]);

  return { favorites, loadingFavorites };
}
