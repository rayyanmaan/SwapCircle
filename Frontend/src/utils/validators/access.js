/**
 * Safe property access utility
 */

export const safeGet = (obj, path, fallback = null) => {
  if (!obj || typeof obj !== 'object') return fallback;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return fallback;
    current = current[key];
  }

  return current ?? fallback;
};
