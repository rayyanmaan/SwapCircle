import React from 'react'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import SwapHistory from './SwapHistory'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@/services/api')

describe('SwapHistory', () => {
  afterEach(() => jest.clearAllMocks())

  test('shows empty message when no swaps', async () => {
    const { itemsAPI } = require('@/services/api')
    itemsAPI.getSwapHistory = jest.fn().mockResolvedValueOnce([])
    // Simulate logged-in user
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ id: 'user_1' }))
    renderWithProviders(<SwapHistory />)
    await waitFor(() => expect(screen.getByText('No swap history yet.')).toBeInTheDocument())
  })

  test('shows counts and filters on tabs', async () => {
    const { itemsAPI } = require('@/services/api')
    const swapData = [
      { id: 's1', is_seller: false, item: { id: '1', title: 'Received Item', images: [] }, other_user: { username: 'seller1' }, credits_required: 2, created_at: new Date().toISOString() },
      { id: 's2', is_seller: true, item: { id: '2', title: 'Given Item', images: [] }, other_user: { username: 'buyer1' }, credits_required: 3, created_at: new Date().toISOString() },
    ]
    itemsAPI.getSwapHistory = jest.fn().mockResolvedValueOnce(swapData)
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ id: 'user_1' }))

    renderWithProviders(<SwapHistory />)
    await waitFor(() => expect(screen.queryByText('Loading swap history...')).not.toBeInTheDocument())

    // Check counts in tab labels (use role=tab to avoid matching content in items)
    const receivedTab = screen.getByRole('tab', { name: /Received/i })
    const givenTab = screen.getByRole('tab', { name: /Given Away/i })
    expect(receivedTab).toHaveTextContent('(1)')
    expect(givenTab).toHaveTextContent('(1)')

    // Clicking Received tab should filter (use userEvent to wrap actions in act)
    await userEvent.click(receivedTab)
    await waitFor(() => expect(screen.getByText('Received Item')).toBeInTheDocument())
    expect(screen.queryByText('Given Item')).not.toBeInTheDocument()
  })
})
