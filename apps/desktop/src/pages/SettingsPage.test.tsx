import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import { SettingsPage } from './SettingsPage'

declare global {
  interface Window {
    hermes: {
      config: {
        get: ReturnType<typeof vi.fn>
        save: ReturnType<typeof vi.fn>
      }
    }
  }
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.hermes = {
      config: {
        get: vi.fn(async () => ({
          model: 'nous/hermes-agent',
          agent: { max_turns: 90, subagents_enabled: true, planning_mode: 'balanced' },
          terminal: { backend: 'local', timeout: 180, cwd: '.', target: 'workspace' },
          visualClient: {
            connection: {
              baseUrl: 'http://127.0.0.1:3000/v1',
              apiKey: '',
              gatewayPort: 3000,
              healthPath: '/health',
            },
          },
        })),
        save: vi.fn(async () => ({ success: true })),
      },
    } as Window['hermes']
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the visual client tabs and blocks invalid numeric values', async () => {
    render(
      <I18nProvider>
        <SettingsPage />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Connection' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Automation' }))
    fireEvent.change(screen.getByLabelText('Max turns'), {
      target: { value: '0' },
    })

    expect(screen.getByText('Max turns must be at least 1.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(window.hermes.config.save).not.toHaveBeenCalled()
  })

  it('saves the expanded desktop config model', async () => {
    render(
      <I18nProvider>
        <SettingsPage />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Base URL')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Base URL'), {
      target: { value: 'http://localhost:3000/v1' },
    })
    fireEvent.change(screen.getByLabelText('Gateway port'), {
      target: { value: '3100' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Automation' }))
    fireEvent.change(screen.getByLabelText('Max turns'), {
      target: { value: '120' },
    })
    fireEvent.click(screen.getByLabelText('Streaming SSE'))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(window.hermes.config.save).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'nous/hermes-agent',
          agent: expect.objectContaining({ max_turns: 120 }),
          visualClient: expect.objectContaining({
            connection: expect.objectContaining({
              baseUrl: 'http://localhost:3000/v1',
              gatewayPort: 3100,
            }),
            session: expect.objectContaining({
              stream: false,
            }),
          }),
        }),
      )
    })
  })
})
