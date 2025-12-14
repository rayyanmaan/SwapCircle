import React from 'react'
import { screen, waitFor } from '@testing-library/react'
// Mock the Next app router so components that use useRouter do not require a mounted App Router
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }))
import Home from './page'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

jest.mock('@/services/api')

describe('Home page', () => {
  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('shows empty message when no featured items', async () => {
    const { itemsAPI } = require('@/services/api')
    itemsAPI.getItems.mockResolvedValueOnce([])
    renderWithProviders(<Home />)
    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/Loading featured items/)).not.toBeInTheDocument())
    expect(screen.getByText(/No items available yet/)).toBeInTheDocument()
  })

  test('filters out unavailable items and shows only available ones', async () => {
    const { itemsAPI } = require('@/services/api')
    const items = [
      { id: '1', title: 'Good Item', status: 'available', images: [] },
      { id: '2', title: 'Swapped Item', status: 'swapped', images: [] },
    ]
    itemsAPI.getItems.mockResolvedValueOnce(items)
    renderWithProviders(<Home />)
    await waitFor(() => expect(screen.queryByText(/Loading featured items/)).not.toBeInTheDocument())
    expect(screen.getByText('Good Item')).toBeInTheDocument()
    expect(screen.queryByText('Swapped Item')).not.toBeInTheDocument()
  })

  test('shows error message when items API fails', async () => {
    const { itemsAPI } = require('@/services/api')
    itemsAPI.getItems.mockRejectedValueOnce(new Error('Network error'))
    renderWithProviders(<Home />)
    await waitFor(() => expect(screen.getByText(/Failed to load featured items|Network error/)).toBeInTheDocument())
  })
})
