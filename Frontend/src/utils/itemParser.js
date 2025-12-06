/**
 * Utility functions to parse item metadata from description
 * 
 * The UploadForm stores metadata in the description field in this format:
 * "Main description\n\nCategory: X\nSize: Y\nLocation: Z\nCondition: W\nBranded: V\nCredits: N"
 */

/**
 * Parse item metadata from description string
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
 * Get full image URL from backend image object
 * @param {Object} image - Image object with url property
 * @param {string} apiBaseUrl - Base URL for the API (defaults to localhost:8000)
 * @returns {string} Full image URL
 */
export function getImageUrl(image, apiBaseUrl = null) {
  if (!image || !image.url) {
    return '/api/placeholder/300';
  }

  // Use provided base URL, fall back to env var, then localhost
  const baseUrl = apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // If URL already starts with http(s), it's absolute — return as is
  // This handles external CDN URLs or fully-qualified backend URLs
  if (image.url.startsWith('http')) {
    return image.url;
  }

  // Ensure relative URL starts with / for proper path joining
  // Example: "static/images/abc.jpg" becomes "/static/images/abc.jpg"
  const url = image.url.startsWith('/') ? image.url : `/${image.url}`;
  // Combine base URL with relative path (e.g., "http://localhost:8000/static/images/abc.jpg")
  return `${baseUrl}${url}`;
}

