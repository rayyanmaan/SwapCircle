import { getItemMetadata, getImageUrl } from '@/utils/itemParser';
import { PLACEHOLDER_IMAGE_URL } from '@/config/constants';

// Normalize backend status to a limited set for UI
export function normalizeStatus(status) {
  const s = (status || '').toLowerCase();
  if (['available', 'active', 'open'].includes(s)) return 'available';
  if (['pending', 'in_progress', 'locked'].includes(s)) return 'pending';
  if (['unavailable', 'swapped', 'closed', 'sold'].includes(s)) return 'unavailable';
  return 'available';
}

// Transform backend item shape to ListingCard-friendly shape
export function toListingCardData(item) {
  if (!item) return null;
  const metadata = getItemMetadata(item);
  const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
  const imageUrl = firstImage ? getImageUrl(firstImage) : '/api/placeholder/300';

  return {
    id: item.id,
    title: item.title,
    size: metadata.size || 'Size M',
    credits: metadata.credits || 1,
    condition: metadata.condition || 'Good',
    location: metadata.location || null,
    category: metadata.category || null,
    timestamp: 'Recently',
    image: imageUrl,
    status: normalizeStatus(item.status || 'available'),
    showSwappedStatus: true,
    owner_id: item.owner_id,
  };
}

// Transform backend item shape to ProductDetail-friendly shape
export function toProductDetailData(item) {
  if (!item) return null;
  const metadata = getItemMetadata(item);
  const images = item.images && item.images.length > 0
    ? item.images.map((img) => getImageUrl(img))
    : [PLACEHOLDER_IMAGE_URL];

  return {
    id: item.id,
    title: item.title,
    condition: metadata.condition || 'Like New',
    brand: metadata.branded === 'Yes' ? 'Branded' : 'Unknown',
    size: metadata.size || 'M',
    location: metadata.location || null,
    description: metadata.mainDescription,
    credits: metadata.credits || 2,
    images,
    owner_id: item.owner_id,
    status: normalizeStatus(item.status || 'available'),
  };
}
