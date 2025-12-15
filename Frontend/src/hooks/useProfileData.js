import { useEffect, useMemo, useState } from 'react';
import { itemsAPI, userAPI } from '@/services/api';
import { getItemMetadata, getImageUrl } from '@/utils/itemParser';

// Handles fetching core profile data (user info, listings, swap history, rating stats)
// to keep data concerns out of the Profile component.
export function useProfileData(usernameProp, isAuthenticated, authUser) {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  const [ratingStats, setRatingStats] = useState({ average_rating: null, total_ratings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = useMemo(() => !usernameProp && isAuthenticated && authUser, [usernameProp, isAuthenticated, authUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        let userData;
        if (usernameProp) {
          userData = await userAPI.getUserByUsername(usernameProp);
        } else if (isAuthenticated && authUser) {
          userData = await userAPI.getUser(authUser.id);
        } else {
          setLoading(false);
          return;
        }

        setUser({
          id: userData.id,
          name: userData.full_name || userData.username || 'User',
          username: userData.username,
          email: userData.email || '',
          avatar: (userData.full_name || userData.username || 'U')[0].toUpperCase(),
          credits: userData.credits || 0,
          listed: 0,
          swapped: 0,
          profile_pic: userData.profile_pic || null,
          bio: userData.bio || '',
          location: userData.location || '',
          instagram_handle: userData.instagram_handle || '',
          whatsapp_number: userData.whatsapp_number || '',
          facebook_url: userData.facebook_url || '',
          twitter_handle: userData.twitter_handle || '',
          linkedin_url: userData.linkedin_url || '',
        });

        setRatingStats({
          average_rating: userData.average_rating || null,
          total_ratings: userData.total_ratings || 0,
        });

        // Fetch user's items
        const userItems = await itemsAPI.getItems({ owner_id: userData.id });
        const transformedListings = userItems.map((item) => {
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
        setListings(transformedListings);

        // Swap history only for own profile
        if (isOwnProfile && isAuthenticated && authUser) {
          try {
            const historyData = await itemsAPI.getSwapHistory();
            const normalizedHistory = Array.isArray(historyData) ? historyData : [];
            setSwapHistory(normalizedHistory);
            setUser((prev) => (prev ? { ...prev, swapped: normalizedHistory.length } : null));
          } catch (err) {
            if (!(err?.message || '').includes('authorization')) {
              console.error('Error fetching swap history:', err);
            }
            setSwapHistory([]);
            setUser((prev) => (prev ? { ...prev, swapped: 0 } : null));
          }
        }

        // Update listed count
        setUser((prev) => (prev ? { ...prev, listed: transformedListings.length } : null));
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [usernameProp, isAuthenticated, authUser, isOwnProfile]);

  // Keep swapped counter in sync if swapHistory changes later
  useEffect(() => {
    setUser((prev) => (prev ? { ...prev, swapped: swapHistory.length } : null));
  }, [swapHistory]);

  return {
    user,
    setUser,
    listings,
    swapHistory,
    ratingStats,
    setRatingStats,
    loading,
    error,
    isOwnProfile,
  };
}
