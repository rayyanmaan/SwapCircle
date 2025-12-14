import React from 'react'
import Logo from './Logo'
import { render } from '@testing-library/react'

describe('Logo', () => {
  test('renders with text by default', () => {
    const { getByText } = render(<Logo />)
    expect(getByText('SwapCircle')).toBeInTheDocument()
  })

  test('does not render text when showText is false', () => {
    const { queryByText } = render(<Logo showText={false} />)
    expect(queryByText('SwapCircle')).toBeNull()
  })
})
