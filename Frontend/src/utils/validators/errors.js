/**
 * Error categorization utility
 */

export const categorizeError = (error) => {
  if (!error) return 'unknown';

  const message = error.message || error.toString();

  if (message.includes('401') || message.includes('Unauthorized') || message.includes('token')) {
    return 'auth';
  }

  if (message.includes('40') || message.includes('validation') || message.includes('required')) {
    return 'validation';
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('Connection')) {
    return 'network';
  }

  return 'unknown';
};
