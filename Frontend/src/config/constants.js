/**
 * Frontend Configuration Constants
 * Centralized defaults for API URLs and placeholders
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Placeholder images
export const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_URL || '/placeholder.svg';

// Validate API URL in development
if (typeof window !== 'undefined' && !API_BASE_URL.startsWith('http')) {
  console.warn('Invalid API_BASE_URL:', API_BASE_URL, 'defaulting to http://localhost:8000');
}

export default {
  API_BASE_URL,
  PLACEHOLDER_IMAGE_URL,
};
