import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Footer from './Footer'
import { screen } from '@testing-library/dom'

describe('Footer', () => {
  beforeEach(() => jest.resetAllMocks())

  test('renders policy links', () => {
    const { getByLabelText } = render(<Footer />)
    expect(getByLabelText('Read our privacy policy')).toBeInTheDocument()
    expect(getByLabelText('Read our terms of service')).toBeInTheDocument()
    expect(getByLabelText('Read our cookie policy')).toBeInTheDocument()
    expect(getByLabelText('Read our refund and returns policy')).toBeInTheDocument()
    // Ensure links point to the expected paths
    expect(getByLabelText('Read our privacy policy').getAttribute('href')).toBe('/privacy')
    expect(getByLabelText('Read our terms of service').getAttribute('href')).toBe('/terms')
    expect(getByLabelText('Read our cookie policy').getAttribute('href')).toBe('/cookies')
    expect(getByLabelText('Read our refund and returns policy').getAttribute('href')).toBe('/refund-policy')
  })

  test('opens and closes shipping modal', async () => {
    render(<Footer />)
    const shippingButton = screen.getByLabelText('View shipping and returns information')
    fireEvent.click(shippingButton)
    // The modal header is a heading element; select it via role to avoid matching the link/button text
    expect(screen.getByRole('heading', { name: /Shipping & Returns/i })).toBeInTheDocument()
    // Click the Got it button to close
    const gotIt = screen.getByText('Got it')
    fireEvent.click(gotIt)
    expect(screen.queryByRole('heading', { name: /Shipping & Returns/i })).not.toBeInTheDocument()
  })
})
