import React from 'react'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { waitFor } from '@testing-library/react'

jest.mock('@/services/api')
// Mock the app-router's useRouter before importing components that call it
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))
import GuestRoute from './GuestRoute'

describe('GuestRoute', () => {
  beforeEach(() => jest.clearAllMocks())

  test('redirects authenticated users to /browse', async () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ id: 'u1', username: 'tester' }))
    renderWithProviders(<GuestRoute><div>Guest Only</div></GuestRoute>)
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/browse'))
  })

  test('renders children for guest users', async () => {
    localStorage.removeItem('token')
    const { getByText } = renderWithProviders(<GuestRoute><div>Guest Only</div></GuestRoute>)
    await waitFor(() => expect(getByText('Guest Only')).toBeInTheDocument())
  })
})
