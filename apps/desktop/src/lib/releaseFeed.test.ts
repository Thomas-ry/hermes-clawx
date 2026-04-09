import { describe, expect, it, vi } from 'vitest'
import { fetchReleaseFeedSummary, parseReleaseFeedSummary, PUBLIC_UPDATE_FEED_URL } from './releaseFeed'

describe('parseReleaseFeedSummary', () => {
  it('keeps the required release metadata and sections', () => {
    const parsed = parseReleaseFeedSummary({
      version: '0.1.1',
      tag: 'v0.1.1',
      previousTag: 'v0.1.0',
      compareUrl: 'https://example.com/compare',
      publishedAt: '2026-04-09T10:00:00.000Z',
      sections: [
        {
          category: 'Features',
          items: [{ summary: 'Add changelog panel', hash: 'abcdef0', author: 'admin' }],
        },
      ],
    })

    expect(parsed.version).toBe('0.1.1')
    expect(parsed.tag).toBe('v0.1.1')
    expect(parsed.sections[0]?.items[0]?.summary).toBe('Add changelog panel')
  })

  it('rejects malformed payloads', () => {
    expect(() => parseReleaseFeedSummary({ tag: 'v0.1.1' })).toThrow('Release feed is missing version metadata')
  })
})

describe('fetchReleaseFeedSummary', () => {
  it('loads the latest public feed json', async () => {
    const json = vi.fn().mockResolvedValue({
      version: '0.1.1',
      tag: 'v0.1.1',
      sections: [],
    })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json,
    })

    const summary = await fetchReleaseFeedSummary(fetchMock as unknown as typeof fetch)

    expect(fetchMock).toHaveBeenCalledWith(`${PUBLIC_UPDATE_FEED_URL}/latest.json`, {
      headers: { Accept: 'application/json' },
    })
    expect(summary.tag).toBe('v0.1.1')
  })
})
