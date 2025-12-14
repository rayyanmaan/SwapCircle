import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { useAuth } from './AuthContext'

jest.mock('@/services/api') // use manual mock

function Consumer() {
  const { user, isAuthenticated, loading, login, logout } = useAuth()
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="isAuthenticated">{String(isAuthenticated)}</div>
      <div data-testid="username">{user?.username || 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'pwd')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  afterEach(() => {
    jest.clearAllMocks()
    try { localStorage.clear() } catch (e) {}
  })

  test('initializes as logged out when no token present', async () => {
    renderWithProviders(<Consumer />)
    // We don't require a synchronous "loading" value because init is async.
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('ready'))
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(screen.getByTestId('username').textContent).toBe('no-user')
  })

  test('login sets user and isAuthenticated', async () => {
    renderWithProviders(<Consumer />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('ready'))
    // Use testing-library events to ensure state updates are wrapped properly
    const loginBtn = screen.getByText('login')
    loginBtn.click()
    await waitFor(() => expect(screen.getByTestId('isAuthenticated').textContent).toBe('true'))
    expect(screen.getByTestId('username').textContent).toBe('tester')
  })

  test('logout clears user', async () => {
    // Pre-populate localStorage to simulate logged in
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ username: 'tester' }))
    renderWithProviders(<Consumer />)
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('ready'))
    // Should be authenticated because authAPI.getCurrentUser is mocked to return a user
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    // Use testing events and wait for the state changes to propagate
    const logoutBtn = screen.getByText('logout')
    logoutBtn.click()
    await waitFor(() => expect(screen.getByTestId('isAuthenticated').textContent).toBe('false'))
    expect(localStorage.getItem('token')).toBeNull()
  })
})
