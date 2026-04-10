import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import { SkillsPage } from './SkillsPage'

declare global {
  interface Window {
    hermes: {
      skills: {
        all: ReturnType<typeof vi.fn>
        viewRaw: ReturnType<typeof vi.fn>
        disabled: {
          get: ReturnType<typeof vi.fn>
          save: ReturnType<typeof vi.fn>
        }
      }
    }
  }
}

describe('SkillsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.hermes = {
      skills: {
        all: vi.fn(async () => [
          { name: 'deploy-helper', description: 'Deploys the current app safely.', category: 'ops' },
          { name: 'design-review', description: 'Reviews UI and interaction quality.', category: 'design' },
        ]),
        viewRaw: vi.fn(async ({ name }: { name: string }) => ({
          skill: {
            name,
            description: name === 'deploy-helper' ? 'Deploys the current app safely.' : 'Reviews UI and interaction quality.',
            category: name === 'deploy-helper' ? 'ops' : 'design',
            content: `# ${name}`,
            path: `/skills/${name}/SKILL.md`,
          },
        })),
        disabled: {
          get: vi.fn(async () => ({ disabled: ['design-review'] })),
          save: vi.fn(async () => ({ success: true })),
        },
      },
    } as Window['hermes']
  })

  afterEach(() => {
    cleanup()
  })

  it('filters skills by search query', async () => {
    render(
      <I18nProvider>
        <SkillsPage />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getAllByText('deploy-helper').length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: 'Enable skill' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'deploy' },
    })

    await waitFor(() => {
      expect(screen.getAllByText('deploy-helper').length).toBeGreaterThan(0)
    })

    expect(screen.queryByRole('button', { name: 'Enable skill' })).not.toBeInTheDocument()
    expect(screen.getByText('Visible: 1')).toBeInTheDocument()
  })
})
