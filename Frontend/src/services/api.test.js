import { apiRequest } from './api'

describe('apiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.NODE_ENV
    localStorage.clear()
  })

  test('includes Authorization header when token present', async () => {
    localStorage.setItem('token', 'abc123')
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hello: 'world' })
    })

    const res = await apiRequest('/test')
    expect(res).toEqual({ hello: 'world' })
    expect(global.fetch).toHaveBeenCalled()
    const callArgs = global.fetch.mock.calls[0]
    const headers = callArgs[1].headers
    expect(headers.Authorization).toBe('Bearer abc123')
  })

  test('throws formatted error for non-ok response with detail message', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Not found' }),
      status: 404,
      statusText: 'Not Found'
    })

    await expect(apiRequest('/missing')).rejects.toThrow('Not found')
  })

  test('handles network fetch TypeError gracefully', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => { throw new TypeError('Failed to fetch') })
    await expect(apiRequest('/x')).rejects.toThrow(/Cannot connect to backend/)
  })
})
