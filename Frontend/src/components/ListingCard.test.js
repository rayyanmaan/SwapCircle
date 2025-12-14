import React from 'react'
import ListingCard from './ListingCard'
import { render, screen, fireEvent } from '@testing-library/react'

describe('ListingCard', () => {
  test('renders title and credits and size', () => {
    render(<ListingCard id="1" title="Test" credits={3} size="M" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  test('shows Unavailable badge when status is locked', () => {
    render(<ListingCard id="1" title="Locked Item" status="locked" credits={2} />)
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  test('favorite button toggles fill', () => {
    render(<ListingCard id="1" title="Fav Item" credits={1} />)
    const button = screen.getByLabelText('Favorite')
    const svg = button.querySelector('svg')
    expect(svg.getAttribute('fill')).toBe('none')
    fireEvent.click(button)
    expect(svg.getAttribute('fill')).toBe('currentColor')
    fireEvent.click(button)
    expect(svg.getAttribute('fill')).toBe('none')
  })
})
