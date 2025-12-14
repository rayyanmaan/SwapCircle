import { getItemMetadata, parseItemMetadata, getImageUrl } from './itemParser'

describe('itemParser utilities', () => {
  test('getItemMetadata returns defaults for falsy item', () => {
    const meta = getItemMetadata(null)
    expect(meta).toMatchObject({ mainDescription: '', category: null, size: null })
  })

  test('getItemMetadata prefers direct fields', () => {
    const item = { description: 'Old', category: 'Jackets', size: 'M', branded: 'Yes', credits: 3 }
    const meta = getItemMetadata(item)
    expect(meta.category).toBe('Jackets')
    expect(meta.credits).toBe(3)
  })

  test('parseItemMetadata extracts fields from description', () => {
    const desc = 'Nice jacket\n\nCategory: Jackets\nSize: M\nCredits: 4\nCondition: Good\nBranded: Yes'
    const meta = parseItemMetadata(desc)
    expect(meta.mainDescription).toContain('Nice jacket')
    expect(meta.category).toBe('Jackets')
    expect(meta.size).toBe('M')
    expect(meta.credits).toBe(4)
  })

  test('getImageUrl handles absolute and relative and empty inputs', () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://api.test'
    process.env.NEXT_PUBLIC_PLACEHOLDER_URL = '/placeholder.svg'

    expect(getImageUrl({ url: 'http://cdn.example/img.jpg' })).toBe('http://cdn.example/img.jpg')
    expect(getImageUrl({ url: 'images/1.png' })).toBe('http://api.test/images/1.png')
    expect(getImageUrl({ url: '/images/2.png' })).toBe('http://api.test/images/2.png')
    expect(getImageUrl({ url: '   ' })).toBe('/placeholder.svg')
    expect(getImageUrl(null)).toBe('/placeholder.svg')
  })
})
