import React from 'react'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
// Mock NotificationCenter to avoid needing NotificationProvider in tests
jest.mock('./NotificationCenter', () => () => <div data-testid="notification-center" />)
import { screen, waitFor } from '@testing-library/react'

jest.mock('@/services/api')
// Mock router before Header import so useRouter is available in tests
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))
import Header from './Header'

describe('Header', () => {
  beforeEach(() => {
    // Clear mocks but keep manual mock implementations provided in __mocks__/
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('shows Log In and Sign Up when unauthenticated', async () => {
    renderWithProviders(<Header />)
    await waitFor(() => expect(screen.getByText('Log In')).toBeInTheDocument())
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    // Browse link should be visible to all users
    expect(screen.getByText('Browse')).toBeInTheDocument()
  })

  test('shows credits and logout when authenticated', async () => {
    // prepare localStorage so AuthProvider thinks user is logged in
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ id: 'user_1', username: 'tester', credits: 5 }))
    renderWithProviders(<Header />)
    // Wait for auth init and check that we show credits (number + 'credits')
    await waitFor(() => expect(screen.getByText(/\d+\s*credits/)).toBeInTheDocument())

    // Open dropdown
    const avatarButton = screen.getByRole('button', { name: /u/i })
    avatarButton.click()
    // Click Logout and ensure router.push called
    const logoutButton = await screen.findByText('Logout')
    logoutButton.click()
    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
