import { describe, expect, it } from 'vitest'
import { createInitialUpdaterState, mergeUpdaterState } from './updaterState'

describe('updaterState', () => {
  it('creates a neutral initial state', () => {
    expect(createInitialUpdaterState()).toEqual({
      status: 'idle',
      available: false,
      checking: false,
      downloading: false,
      downloaded: false,
      version: null,
      downloadedVersion: null,
      progressPercent: null,
      error: null,
      lastCheckedAt: null,
    })
  })

  it('merges patches immutably', () => {
    const initial = createInitialUpdaterState()
    const next = mergeUpdaterState(initial, {
      status: 'checking',
      checking: true,
    })

    expect(next).toEqual({
      ...initial,
      status: 'checking',
      checking: true,
    })
    expect(initial.checking).toBe(false)
  })
})
