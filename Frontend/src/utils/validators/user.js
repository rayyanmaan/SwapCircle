/**
 * User validation and normalization utilities
 */

export const isValidUser = (data) => {
  if (!data || typeof data !== 'object') return false;
  return 'id' in data;
};

export const normalizeUser = (userData) => {
  if (!isValidUser(userData)) {
    return {
      id: null,
      full_name: 'Unknown User',
      username: 'unknown',
      email: '',
      credits: 0,
      avatar: '?',
      email_verified: false,
    };
  }

  return {
    id: userData.id,
    full_name: userData.full_name || userData.username || 'Unknown User',
    username: userData.username || 'unknown',
    email: userData.email || '',
    credits: typeof userData.credits === 'number' ? userData.credits : 0,
    avatar: userData.username?.[0]?.toUpperCase() || '?',
    email_verified: userData.email_verified ?? false,
  };
};
