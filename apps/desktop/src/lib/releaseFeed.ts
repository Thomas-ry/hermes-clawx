export const PUBLIC_UPDATE_FEED_URL = 'https://thomas-ry.github.io/hermes-clawT/updates'

export type ReleaseFeedSection = {
  category: string
  items: Array<{
    summary: string
    hash: string
    author: string
    authoredAt?: string
  }>
}

export type ReleaseFeedSummary = {
  version: string
  tag: string
  previousTag?: string | null
  compareUrl?: string | null
  publishedAt?: string
  sections: ReleaseFeedSection[]
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseReleaseFeedSummary(value: unknown): ReleaseFeedSummary {
  if (!isObject(value)) {
    throw new Error('Release feed is not a JSON object')
  }

  const version = typeof value.version === 'string' ? value.version : ''
  const tag = typeof value.tag === 'string' ? value.tag : ''
  const rawSections = Array.isArray(value.sections) ? value.sections : []
  if (!version || !tag) {
    throw new Error('Release feed is missing version metadata')
  }

  const sections = rawSections
    .filter(isObject)
    .map((section) => {
      const category = typeof section.category === 'string' ? section.category : 'Other'
      const items = Array.isArray(section.items)
        ? section.items
            .filter(isObject)
            .map((item) => ({
              summary: typeof item.summary === 'string' ? item.summary : '',
              hash: typeof item.hash === 'string' ? item.hash : '',
              author: typeof item.author === 'string' ? item.author : '',
              authoredAt: typeof item.authoredAt === 'string' ? item.authoredAt : undefined,
            }))
            .filter((item) => item.summary.length > 0)
        : []
      return { category, items }
    })
    .filter((section) => section.items.length > 0)

  return {
    version,
    tag,
    previousTag: typeof value.previousTag === 'string' ? value.previousTag : null,
    compareUrl: typeof value.compareUrl === 'string' ? value.compareUrl : null,
    publishedAt: typeof value.publishedAt === 'string' ? value.publishedAt : undefined,
    sections,
  }
}

export async function fetchReleaseFeedSummary(fetchImpl: typeof fetch = fetch): Promise<ReleaseFeedSummary> {
  const response = await fetchImpl(`${PUBLIC_UPDATE_FEED_URL}/latest.json`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Failed to load release feed (${response.status})`)
  }
  const payload = (await response.json()) as unknown
  return parseReleaseFeedSummary(payload)
}
