/**
 * Item validation and normalization utilities
 */

export const isValidItem = (data) => {
  if (!data || typeof data !== 'object') return false;
  return 'id' in data && 'title' in data;
};

export const normalizeItem = (itemData, parseMetadata) => {
  if (!isValidItem(itemData)) {
    return null;
  }

  const metadata = parseMetadata ? parseMetadata(itemData.description || '') : {};

  return {
    id: itemData.id,
    title: itemData.title || 'Untitled Item',
    description: metadata.mainDescription || itemData.description || '',
    condition: metadata.condition || 'Unknown',
    brand: metadata.branded === 'Yes' ? 'Branded' : 'Unknown',
    size: metadata.size || 'One Size',
    credits: typeof metadata.credits === 'number' ? metadata.credits : 2,
    images: Array.isArray(itemData.images) ? itemData.images : [],
    owner_id: itemData.owner_id || null,
    status: itemData.status || 'available',
  };
};
