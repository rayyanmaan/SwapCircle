import React from 'react'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { screen, waitFor } from '@testing-library/react'

jest.mock('@/services/api')
// Mock the app-router's useRouter before importing components that call it
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))
import ProtectedRoute from './ProtectedRoute'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('redirects to home when not authenticated', async () => {
    // Ensure no token
    localStorage.removeItem('token')
    const TestChild = () => <div>Secret Content</div>
    renderWithProviders(<ProtectedRoute><TestChild /></ProtectedRoute>)
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'))
  })

  test('renders children when authenticated', async () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ id: 'u1', username: 'tester' }))
    // authAPI.getCurrentUser mocked to return a user
    const TestChild = () => <div>Secret Content</div>
    renderWithProviders(<ProtectedRoute><TestChild /></ProtectedRoute>)
    // Wait for auth initialization to finish, then assert no redirect and content visible
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    await waitFor(() => expect(pushMock).not.toHaveBeenCalled())
    expect(screen.getByText('Secret Content')).toBeInTheDocument()
  })
})
