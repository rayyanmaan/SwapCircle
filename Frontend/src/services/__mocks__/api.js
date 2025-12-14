// Manual Jest mock for api.js - keeps tests deterministic by stubbing network behavior.
const mockUser = { id: 'user_1', username: 'tester', credits: 10, full_name: 'Test User' }

const authAPI = {
  login: jest.fn(async (email, password) => {
    // Simple successful login stub
    if (email === 'bad@example.com') throw new Error('Invalid credentials')
    // Simulate storage of token/user
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify(mockUser))
    }
    return { user: mockUser, token: 'fake-token' }
  }),
  register: jest.fn(async (email, password, username, fullName) => {
    return { token: 'fake-token', user: { id: 'new_user', username, full_name: fullName } }
  }),
  getCurrentUser: jest.fn(async () => mockUser),
  logout: jest.fn(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }),
}

// Other API modules used by components can be stubbed as needed.
const itemAPI = {
  getFeatured: jest.fn(async () => []),
}

const itemsAPI = {
  getItems: jest.fn(async () => []),
}

module.exports = {
  authAPI,
  itemAPI,
  itemsAPI,
}
