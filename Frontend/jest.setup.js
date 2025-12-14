import '@testing-library/jest-dom'

// Use jest-fetch-mock's enabled mocks helper to make `fetch` a mock.
const fetchMock = require('jest-fetch-mock')
fetchMock.enableMocks()

// Provide a simple helper to clear localStorage and mocks between tests.
beforeEach(() => {
  jest.clearAllMocks()
  try { localStorage.clear() } catch (e) {}
  if (global.fetch && global.fetch.resetMocks) {
    global.fetch.resetMocks()
  }
})
