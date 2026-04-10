import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import { DashboardPage } from './DashboardPage'
import { ROUTER_FUTURE_FLAGS } from '../lib/routerFuture'

vi.mock('../lib/hermesClient', () => ({
  hermesStatus: vi.fn(async () => ({
    runtime: {
      hermesHomeDir: '/tmp/hermes',
      hermesInstallDir: '/tmp/runtime',
      gatewayPort: 8642,
    },
    gateway: { state: 'running' },
    updater: { status: 'idle' },
  })),
}))

vi.mock('../lib/releaseFeed', () => ({
  PUBLIC_UPDATE_FEED_URL: 'https://example.com/updates',
  fetchReleaseFeedSummary: vi.fn(async () => ({
    version: '0.1.0',
    publishedAt: '2026-04-10T00:00:00.000Z',
    previousTag: 'v0.0.9',
    compareUrl: 'https://example.com/compare',
    sections: [],
  })),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.hermes = {
      updater: {
        onState: vi.fn(() => () => undefined),
        check: vi.fn(async () => ({})),
        download: vi.fn(async () => ({})),
        install: vi.fn(async () => ({})),
        status: vi.fn(async () => ({})),
      },
      gateway: {
        start: vi.fn(async () => ({})),
        stop: vi.fn(async () => ({})),
        restart: vi.fn(async () => ({})),
        onLog: vi.fn(() => () => undefined),
      },
      setup: {
        inspect: vi.fn(async () => ({
          ok: false,
          checkedAt: '2026-04-10T00:00:00.000Z',
          probes: [
            { id: 'node', label: 'Node.js', ok: true, detail: 'v22.0.0' },
            { id: 'uv', label: 'uv', ok: false, detail: 'uv not installed' },
          ],
        })),
      },
    } as unknown as Window['hermes']
  })

  afterEach(() => {
    cleanup()
  })

  it('renders setup inspection results and refreshes them on demand', async () => {
    render(
      <I18nProvider>
        <HashRouter future={ROUTER_FUTURE_FLAGS}>
          <DashboardPage />
        </HashRouter>
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Setup & Connection')).toBeInTheDocument()
      expect(screen.getByText('uv not installed')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Run environment check' }))

    await waitFor(() => {
      expect(window.hermes.setup.inspect).toHaveBeenCalledTimes(2)
    })
  })
})
