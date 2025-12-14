import React from 'react'
import { render } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'

// Simple wrapper used in tests to provide Auth context and other app providers as needed.
export function renderWithProviders(ui, { providerProps = {}, ...renderOptions } = {}) {
  // For many tests it's enough to wrap with AuthProvider and control localStorage to fake auth state.
  function Wrapper({ children }) {
    return <AuthProvider {...providerProps}>{children}</AuthProvider>
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
