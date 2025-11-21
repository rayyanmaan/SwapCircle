/**
 * API service for making HTTP requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const url = `${API_BASE_URL}${endpoint}`;
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
      throw new Error(data.detail || data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
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
   * Create new item
   */
  async createItem(itemData) {
    return apiRequest('/items', {
      method: 'POST',
      body: itemData,
    });
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
};

export default apiRequest;

