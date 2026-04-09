export type UpdaterState = {
  status:
    | 'idle'
    | 'dev-only'
    | 'packaged-required'
    | 'checking'
    | 'available'
    | 'not-available'
    | 'downloading'
    | 'downloaded'
    | 'error'
  available: boolean
  checking: boolean
  downloading: boolean
  downloaded: boolean
  version: string | null
  downloadedVersion: string | null
  progressPercent: number | null
  error: string | null
  lastCheckedAt: string | null
}

export function createInitialUpdaterState(): UpdaterState {
  return {
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
  }
}

export function mergeUpdaterState(
  current: UpdaterState,
  patch: Partial<UpdaterState>,
): UpdaterState {
  return {
    ...current,
    ...patch,
  }
}
