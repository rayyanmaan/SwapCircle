import { useEffect, useState } from 'react';
import { userAPI, ratingAPI } from '@/services/api';

// Fetch seller info and rating stats for a given ownerId. Keeps data fetching out of the UI component.
export function useSellerInfo(ownerId) {
  const [seller, setSeller] = useState(null);
  const [sellerRatingStats, setSellerRatingStats] = useState({ average_rating: null, total_ratings: 0 });

  useEffect(() => {
    const fetchSeller = async () => {
      if (!ownerId) {
        setSeller(null);
        setSellerRatingStats({ average_rating: null, total_ratings: 0 });
        return;
      }

      try {
        const sellerData = await userAPI.getUser(ownerId);
        setSeller({
          name: sellerData.full_name || sellerData.username || 'Unknown',
          username: sellerData.username,
          avatar: sellerData.username?.[0]?.toUpperCase() || sellerData.full_name?.[0]?.toUpperCase() || '?',
          profile_pic: sellerData.profile_pic || null,
          credits: sellerData.credits || 0,
          location: sellerData.location || null,
          lockDuration: '24 hours',
        });

        try {
          const stats = await ratingAPI.getRatingStats(ownerId);
          setSellerRatingStats({
            average_rating: stats.average_rating,
            total_ratings: stats.total_ratings || 0,
          });
        } catch (err) {
          console.error('Error fetching seller rating stats:', err);
          setSellerRatingStats({ average_rating: null, total_ratings: 0 });
        }
      } catch (err) {
        console.error('Error fetching seller:', err);
        setSeller({
          name: 'Unknown',
          username: null,
          avatar: '?',
          credits: 0,
          location: null,
          lockDuration: '24 hours',
          profile_pic: null,
        });
        setSellerRatingStats({ average_rating: null, total_ratings: 0 });
      }
    };

    fetchSeller();
  }, [ownerId]);

  return { seller, sellerRatingStats };
}
