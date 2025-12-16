/**
 * Utility functions to parse item metadata from description
 * 
 * NOTE: New items store metadata as separate fields. This function provides
 * backward compatibility for old items that stored metadata in description.
 */

import { PLACEHOLDER_IMAGE_URL, API_BASE_URL } from '@/config/constants';

/**
 * Get item metadata, preferring direct fields but falling back to parsing description
 * @param {Object} item - The item object (may have direct fields or metadata in description)
 * @returns {Object} Metadata with main description and extracted fields
 */
export function getItemMetadata(item) {
  if (!item) {
    return {
      mainDescription: '',
      category: null,
      size: null,
      location: null,
      condition: null,
      branded: null,
      credits: null,
    };
  }

  // If item has direct fields (new format), use them
  if (item.category !== undefined || item.size !== undefined || item.location !== undefined) {
    return {
      mainDescription: item.description || '',
      category: item.category || null,
      size: item.size || null,
      location: item.location || null,
      condition: item.condition || null,
      branded: item.branded || null,
      credits: item.credits || null,
    };
  }

  // Fallback: parse from description (old format)
  return parseItemMetadata(item.description);
}

/**
 * Parse item metadata from description string (for backward compatibility)
 * @param {string} description - The item description that may contain metadata
 * @returns {Object} Parsed metadata with main description and extracted fields
 */
export function parseItemMetadata(description) {
  if (!description) {
    return {
      mainDescription: '',
      category: null,
      size: null,
      location: null,
      condition: null,
      branded: null,
      credits: null,
    };
  }

  // Split by double newline to separate main description from metadata
  // This assumes the UploadForm stores metadata after a blank line
  // Example: "Nice jacket\n\nCategory: Jackets\nSize: M"
  const parts = description.split('\n\n');
  const mainDescription = parts[0] || description;

  // Default values
  let category = null;
  let size = null;
  let location = null;
  let condition = null;
  let branded = null;
  let credits = null;

  // Parse metadata from the rest of the description
  if (parts.length > 1) {
    // Join all parts after the first (in case metadata itself has blank lines)
    const metadataSection = parts.slice(1).join('\n\n');
    
    // Extract each field using regex with case-insensitive matching
    // Regex pattern: "FieldName: value" where value is everything until newline or end
    const categoryMatch = metadataSection.match(/Category:\s*(.+?)(?:\n|$)/i);
    if (categoryMatch) {
      category = categoryMatch[1].trim();
    }

    const sizeMatch = metadataSection.match(/Size:\s*(.+?)(?:\n|$)/i);
    if (sizeMatch) {
      size = sizeMatch[1].trim();
    }

    const locationMatch = metadataSection.match(/Location:\s*(.+?)(?:\n|$)/i);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }

    const conditionMatch = metadataSection.match(/Condition:\s*(.+?)(?:\n|$)/i);
    if (conditionMatch) {
      condition = conditionMatch[1].trim();
    }

    const brandedMatch = metadataSection.match(/Branded:\s*(.+?)(?:\n|$)/i);
    if (brandedMatch) {
      branded = brandedMatch[1].trim();
    }

    // Credits expects a numeric value (\d+), parse as integer with base 10
    const creditsMatch = metadataSection.match(/Credits:\s*(\d+)(?:\n|$)/i);
    if (creditsMatch) {
      credits = parseInt(creditsMatch[1], 10);
    }
  }

  return {
    mainDescription,
    category,
    size,
    location,
    condition,
    branded,
    credits,
  };
}

/**
 * Resolve an image reference into a usable URL.
 * - If already absolute (http/https), return as-is.
 * - If relative, prefix with apiBaseUrl -> NEXT_PUBLIC_API_URL -> http://localhost:8000.
 * - If missing, fall back to the static placeholder asset.
 * @param {Object} image - Image object with url property
 * @param {string|null} apiBaseUrl - Optional base URL override
 * @returns {string} Full image URL safe for rendering
 */
export function getImageUrl(image, apiBaseUrl = null) {
  // Safety check: ensure image.url is a non-empty string.
  // Prevents crashes from malformed backend data (non-string types, nulls, empty/whitespace strings).
  if (!image || typeof image.url !== 'string' || !image.url.trim()) {
    return PLACEHOLDER_IMAGE_URL;
  }

  const trimmedUrl = image.url.trim();

  // Use provided base URL, fall back to centralized config
  const baseUrl = apiBaseUrl || API_BASE_URL;
  
  // If URL already starts with http(s), it's absolute — return as is
  // This handles external CDN URLs or fully-qualified backend URLs
  if (trimmedUrl.startsWith('http')) {
    return trimmedUrl;
  }

  // Ensure relative URL starts with / for proper path joining
  // Example: "static/images/abc.jpg" becomes "/static/images/abc.jpg"
  const url = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
  // Combine base URL with relative path (e.g., "http://localhost:8000/static/images/abc.jpg")
  return `${baseUrl}${url}`;
}