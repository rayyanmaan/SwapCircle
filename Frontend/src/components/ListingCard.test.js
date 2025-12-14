import React from 'react'
import { render, screen } from '@testing-library/react'
import ListingCard from './ListingCard'

describe('ListingCard status display', () => {
  test('pending items are faded and show Pending badge', () => {
    render(<ListingCard id="1" title="Pending Item" status="pending" credits={2} />)
    const link = screen.getByRole('link')
    // faded class applied
    expect(link.className).toContain('listing-unavailable')
    // Pending badge visible
    expect(screen.getByText('Pending')).toBeInTheDocument()
    // Unavailable badge should not be present for pending
    expect(screen.queryByText('Unavailable')).toBeNull()
    // there should be an overlay element under the badge
    expect(document.querySelector('.unavailable-overlay')).toBeTruthy()
  })

  test('swapped items are faded and show Unavailable badge', () => {
    render(<ListingCard id="1" title="Swapped Item" status="swapped" credits={2} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('listing-unavailable')
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    // overlay should be present for unavailable items as well
    expect(document.querySelector('.unavailable-overlay')).toBeTruthy()
  })
})
