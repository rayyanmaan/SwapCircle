<<<<<<< HEAD
/**
 * API service for making HTTP requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Validate API_BASE_URL
if (typeof window !== 'undefined' && !API_BASE_URL.startsWith('http')) {
  console.error('Invalid API_BASE_URL:', API_BASE_URL);
  console.error('Please set NEXT_PUBLIC_API_URL in your .env.local file');
}

// Enable mock mode for frontend testing when backend is not available
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || false;

// Mock users for testing (only used in MOCK_MODE)
const MOCK_USERS = {
  'test@swapcircle.com': { password: 'test123', username: 'testuser', full_name: 'Test User', credits: 5 },
  'student@minerva.edu': { password: 'password123', username: 'student1', full_name: 'Student One', credits: 3 },
  'demo@example.com': { password: 'demo123', username: 'demo', full_name: 'Demo User', credits: 10 },
};

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  // Log URL in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('API Request:', url);
  }
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle structured error responses
      let errorMessage = 'An error occurred';
      
      if (data.detail) {
        // If detail is an object with validation errors
        if (typeof data.detail === 'object' && !Array.isArray(data.detail)) {
          if (data.detail.message) {
            errorMessage = data.detail.message;
            // Add validation errors if present
            if (data.detail.errors && Array.isArray(data.detail.errors)) {
              const validationErrors = data.detail.errors
                .map(err => {
                  if (typeof err === 'string') return err;
                  if (err.field && err.message) {
                    return `${err.field}: ${err.message}`;
                  }
                  return err.message || JSON.stringify(err);
                })
                .join(', ');
              if (validationErrors) {
                errorMessage += ` - ${validationErrors}`;
              }
            }
          } else {
            // If it's just an object, try to stringify it nicely
            errorMessage = JSON.stringify(data.detail, null, 2);
          }
        } else if (Array.isArray(data.detail)) {
          // If detail is an array of errors
          errorMessage = data.detail.map(err => 
            typeof err === 'string' ? err : JSON.stringify(err)
          ).join(', ');
        } else {
          // If detail is a string
          errorMessage = data.detail;
        }
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      const error = new Error(errorMessage);
      // Attach the full error data for debugging
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Handle network errors (connection refused, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - Backend may not be running:', error);
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`);
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  async register(email, password, username, fullName) {
    if (MOCK_MODE) {
      // Mock registration - create user and auto-login
      const mockUser = {
        id: `mock_${Date.now()}`,
        email,
        username,
        full_name: fullName || null,
        credits: 0,
      };
      const mockToken = `mock_token_${Date.now()}`;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
      
      return {
        token: mockToken,
        user: mockUser,
        message: 'Registration successful (mock mode)',
      };
    }

    return apiRequest('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        username,
        full_name: fullName,
      },
    });
  },

  /**
   * Login user
   */
  async login(email, password) {
    if (MOCK_MODE) {
      // Mock login - check against mock users or accept any credentials
      const mockUser = MOCK_USERS[email.toLowerCase()];
      
      if (mockUser && mockUser.password === password) {
        // Valid mock user
        const user = {
          id: `mock_${email.replace('@', '_').replace('.', '_')}`,
          email,
          username: mockUser.username,
          full_name: mockUser.full_name,
          credits: mockUser.credits,
        };
        const token = `mock_token_${Date.now()}`;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return { token, user };
      } else if (mockUser && mockUser.password !== password) {
        // Wrong password for known user
        throw new Error('Invalid email or password');
      } else {
        // Unknown user - create mock user (for testing)
        const user = {
          id: `mock_${Date.now()}`,
          email,
          username: email.split('@')[0],
          full_name: null,
          credits: 0,
        };
        const token = `mock_token_${Date.now()}`;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return { token, user };
      }
    }

    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });

    // Store token if provided
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  /**
   * Logout user
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    if (MOCK_MODE) {
      // Return user from localStorage in mock mode
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      }
      throw new Error('Not authenticated');
    }

    return apiRequest('/auth/me');
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    return apiRequest(`/auth/verify/${token}`, {
      method: 'POST',
    });
  },
};

/**
 * User API
 */
export const userAPI = {
  /**
   * Get user by ID
   */
  async getUser(userId) {
    return apiRequest(`/users/${userId}`);
  },

  /**
   * Update user profile
   */
  async updateUser(userId, updates) {
    return apiRequest(`/users/${userId}`, {
      method: 'PATCH',
      body: updates,
    });
  },
};

/**
 * Items API
 */
export const itemsAPI = {
  /**
   * Get all items
   */
  async getItems(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/items${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Get item by ID
   */
  async getItem(itemId) {
    return apiRequest(`/items/${itemId}`);
  },

  /**
   * Create new item with images
   */
  async createItem(itemData, imageFiles = []) {
    const url = `${API_BASE_URL}/items`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // If there are images, use FormData for multipart/form-data
    if (imageFiles.length > 0) {
      const formData = new FormData();
      
      // For FastAPI multipart with Body(), we can send JSON string in a form field
      // The backend route checks content-type and can handle both JSON body and multipart
      // When using multipart, FastAPI can parse the 'item' field as JSON if sent as string
      const itemJson = JSON.stringify({
        title: itemData.title,
        description: itemData.description || null,
      });
      formData.append('item', itemJson);
      
      // Add image files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const config = {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type - browser will set it with boundary for multipart
        },
        body: formData,
      };

      try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
          // Handle structured error responses (validation errors)
          let errorMessage = 'An error occurred';
          
          if (data.detail) {
            // If detail is an object with validation errors
            if (typeof data.detail === 'object' && !Array.isArray(data.detail)) {
              if (data.detail.message) {
                errorMessage = data.detail.message;
                // Add validation errors if present
                if (data.detail.errors && Array.isArray(data.detail.errors)) {
                  const validationErrors = data.detail.errors
                    .map(err => {
                      if (typeof err === 'string') return err;
                      if (err.field && err.message) {
                        return `${err.field}: ${err.message}`;
                      }
                      return err.message || JSON.stringify(err);
                    })
                    .join(', ');
                  if (validationErrors) {
                    errorMessage += ` - ${validationErrors}`;
                  }
                }
              } else {
                // If it's just an object, try to stringify it nicely
                errorMessage = JSON.stringify(data.detail, null, 2);
              }
            } else if (Array.isArray(data.detail)) {
              // If detail is an array of errors
              errorMessage = data.detail.map(err => 
                typeof err === 'string' ? err : JSON.stringify(err)
              ).join(', ');
            } else {
              // If detail is a string
              errorMessage = data.detail;
            }
          } else if (data.message) {
            errorMessage = data.message;
          }
          
          // Log the full error for debugging
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data: data
          });
          
          const error = new Error(errorMessage);
          // Attach the full error data for debugging
          error.data = data;
          throw error;
        }

        return data;
      } catch (error) {
        // Re-throw if it's already an Error with a message
        if (error instanceof Error && error.message) {
          throw error;
        }
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error('Network error - Backend may not be running:', error);
          throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`);
        }
        throw new Error('Network error. Please check your connection.');
      }
    } else {
      // No images, use regular JSON request
      return apiRequest('/items', {
        method: 'POST',
        body: itemData,
      });
    }
  },

  /**
   * Update item
   */
  async updateItem(itemId, updates) {
    return apiRequest(`/items/${itemId}`, {
      method: 'PATCH',
      body: updates,
    });
  },

  /**
   * Delete item
   */
  async deleteItem(itemId) {
    return apiRequest(`/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Request a swap/purchase for an item (creates a swap request)
   */
  async requestSwap(itemId) {
    return apiRequest(`/items/${itemId}/swap`, {
      method: 'POST',
    });
  },

  /**
   * Approve a swap request (owner only)
   */
  async approveSwapRequest(itemId, requestId) {
    return apiRequest(`/items/${itemId}/swap/${requestId}/approve`, {
      method: 'POST',
    });
  },

  /**
   * Reject a swap request (owner only)
   */
  async rejectSwapRequest(itemId, requestId) {
    return apiRequest(`/items/${itemId}/swap/${requestId}/reject`, {
      method: 'POST',
    });
  },

  /**
   * Get swap requests for the authenticated user
   */
  async getSwapRequests() {
    return apiRequest(`/items/swap-requests`, {
      method: 'GET',
    });
  },

  /**
   * Get swap history (approved swaps) for the authenticated user
   */
  async getSwapHistory() {
    return apiRequest(`/items/swap-history`, {
      method: 'GET',
    });
  },
};

export default apiRequest;

=======
/**
 * API service for making HTTP requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Validate API_BASE_URL
if (typeof window !== 'undefined' && !API_BASE_URL.startsWith('http')) {
  console.error('Invalid API_BASE_URL:', API_BASE_URL);
  console.error('Please set NEXT_PUBLIC_API_URL in your .env.local file');
}

// Enable mock mode for frontend testing when backend is not available
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || false;

// Mock users for testing (only used in MOCK_MODE)
const MOCK_USERS = {
  'test@swapcircle.com': { password: 'test123', username: 'testuser', full_name: 'Test User', credits: 5 },
  'student@minerva.edu': { password: 'password123', username: 'student1', full_name: 'Student One', credits: 3 },
  'demo@example.com': { password: 'demo123', username: 'demo', full_name: 'Demo User', credits: 10 },
};

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  // Log URL in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('API Request:', url);
  }
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle structured error responses
      let errorMessage = 'An error occurred';
      
      if (data.detail) {
        // If detail is an object with validation errors
        if (typeof data.detail === 'object' && !Array.isArray(data.detail)) {
          if (data.detail.message) {
            errorMessage = data.detail.message;
            // Add validation errors if present
            if (data.detail.errors && Array.isArray(data.detail.errors)) {
              const validationErrors = data.detail.errors
                .map(err => {
                  if (typeof err === 'string') return err;
                  if (err.field && err.message) {
                    return `${err.field}: ${err.message}`;
                  }
                  return err.message || JSON.stringify(err);
                })
                .join(', ');
              if (validationErrors) {
                errorMessage += ` - ${validationErrors}`;
              }
            }
          } else {
            // If it's just an object, try to stringify it nicely
            errorMessage = JSON.stringify(data.detail, null, 2);
          }
        } else if (Array.isArray(data.detail)) {
          // If detail is an array of errors
          errorMessage = data.detail.map(err => 
            typeof err === 'string' ? err : JSON.stringify(err)
          ).join(', ');
        } else {
          // If detail is a string
          errorMessage = data.detail;
        }
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      const error = new Error(errorMessage);
      // Attach the full error data for debugging
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Handle network errors (connection refused, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - Backend may not be running:', error);
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`);
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  async register(email, password, username, fullName) {
    if (MOCK_MODE) {
      // Mock registration - create user and auto-login
      const mockUser = {
        id: `mock_${Date.now()}`,
        email,
        username,
        full_name: fullName || null,
        credits: 0,
      };
      const mockToken = `mock_token_${Date.now()}`;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
      
      return {
        token: mockToken,
        user: mockUser,
        message: 'Registration successful (mock mode)',
      };
    }

    return apiRequest('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        username,
        full_name: fullName,
      },
    });
  },

  /**
   * Login user
   */
  async login(email, password) {
    if (MOCK_MODE) {
      // Mock login - check against mock users or accept any credentials
      const mockUser = MOCK_USERS[email.toLowerCase()];
      
      if (mockUser && mockUser.password === password) {
        // Valid mock user
        const user = {
          id: `mock_${email.replace('@', '_').replace('.', '_')}`,
          email,
          username: mockUser.username,
          full_name: mockUser.full_name,
          credits: mockUser.credits,
        };
        const token = `mock_token_${Date.now()}`;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return { token, user };
      } else if (mockUser && mockUser.password !== password) {
        // Wrong password for known user
        throw new Error('Invalid email or password');
      } else {
        // Unknown user - create mock user (for testing)
        const user = {
          id: `mock_${Date.now()}`,
          email,
          username: email.split('@')[0],
          full_name: null,
          credits: 0,
        };
        const token = `mock_token_${Date.now()}`;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return { token, user };
      }
    }

    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });

    // Store token if provided
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  /**
   * Logout user
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    if (MOCK_MODE) {
      // Return user from localStorage in mock mode
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      }
      throw new Error('Not authenticated');
    }

    return apiRequest('/auth/me');
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    return apiRequest(`/auth/verify/${token}`, {
      method: 'POST',
    });
  },
};

/**
 * User API
 */
export const userAPI = {
  /**
   * Get user by ID
   */
  async getUser(userId) {
    return apiRequest(`/users/${userId}`);
  },

  /**
   * Update user profile
   */
  async updateUser(userId, updates) {
    return apiRequest(`/users/${userId}`, {
      method: 'PATCH',
      body: updates,
    });
  },
};

/**
 * Items API
 */
export const itemsAPI = {
  /**
   * Get all items
   */
  async getItems(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/items${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Get item by ID
   */
  async getItem(itemId) {
    return apiRequest(`/items/${itemId}`);
  },

  /**
   * Create new item with images
   */
  async createItem(itemData, imageFiles = []) {
    const url = `${API_BASE_URL}/items`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // If there are images, use FormData for multipart/form-data
    if (imageFiles.length > 0) {
      const formData = new FormData();
      
      // For FastAPI multipart with Body(), we can send JSON string in a form field
      // The backend route checks content-type and can handle both JSON body and multipart
      // When using multipart, FastAPI can parse the 'item' field as JSON if sent as string
      const itemJson = JSON.stringify({
        title: itemData.title,
        description: itemData.description || null,
      });
      formData.append('item', itemJson);
      
      // Add image files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const config = {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type - browser will set it with boundary for multipart
        },
        body: formData,
      };

      try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
          // Handle structured error responses (validation errors)
          let errorMessage = 'An error occurred';
          
          if (data.detail) {
            // If detail is an object with validation errors
            if (typeof data.detail === 'object' && !Array.isArray(data.detail)) {
              if (data.detail.message) {
                errorMessage = data.detail.message;
                // Add validation errors if present
                if (data.detail.errors && Array.isArray(data.detail.errors)) {
                  const validationErrors = data.detail.errors
                    .map(err => {
                      if (typeof err === 'string') return err;
                      if (err.field && err.message) {
                        return `${err.field}: ${err.message}`;
                      }
                      return err.message || JSON.stringify(err);
                    })
                    .join(', ');
                  if (validationErrors) {
                    errorMessage += ` - ${validationErrors}`;
                  }
                }
              } else {
                // If it's just an object, try to stringify it nicely
                errorMessage = JSON.stringify(data.detail, null, 2);
              }
            } else if (Array.isArray(data.detail)) {
              // If detail is an array of errors
              errorMessage = data.detail.map(err => 
                typeof err === 'string' ? err : JSON.stringify(err)
              ).join(', ');
            } else {
              // If detail is a string
              errorMessage = data.detail;
            }
          } else if (data.message) {
            errorMessage = data.message;
          }
          
          // Log the full error for debugging
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data: data
          });
          
          const error = new Error(errorMessage);
          // Attach the full error data for debugging
          error.data = data;
          throw error;
        }

        return data;
      } catch (error) {
        // Re-throw if it's already an Error with a message
        if (error instanceof Error && error.message) {
          throw error;
        }
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error('Network error - Backend may not be running:', error);
          throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`);
        }
        throw new Error('Network error. Please check your connection.');
      }
    } else {
      // No images, use regular JSON request
      return apiRequest('/items', {
        method: 'POST',
        body: itemData,
      });
    }
  },

  /**
   * Update item
   */
  async updateItem(itemId, updates) {
    return apiRequest(`/items/${itemId}`, {
      method: 'PATCH',
      body: updates,
    });
  },

  /**
   * Delete item
   */
  async deleteItem(itemId) {
    return apiRequest(`/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Request a swap/purchase for an item (creates a swap request)
   */
  async requestSwap(itemId) {
    return apiRequest(`/swaps/items/${itemId}/request`, {
      method: 'POST',
    });
  },

  /**
   * Approve a swap request (owner only)
   */
  async approveSwapRequest(itemId, requestId) {
    return apiRequest(`/swaps/items/${itemId}/requests/${requestId}/approve`, {
      method: 'POST',
    });
  },

  /**
   * Reject a swap request (owner only)
   */
  async rejectSwapRequest(itemId, requestId) {
    return apiRequest(`/swaps/items/${itemId}/requests/${requestId}/reject`, {
      method: 'POST',
    });
  },

  /**
   * Get swap requests for the authenticated user
   */
  async getSwapRequests() {
    return apiRequest(`/swaps/requests`, {
      method: 'GET',
    });
  },

  /**
   * Get swap history (approved swaps) for the authenticated user
   */
  async getSwapHistory() {
    return apiRequest(`/swaps/history`, {
      method: 'GET',
    });
  },
};

export default apiRequest;

>>>>>>> origin/main
