import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatPage } from './ChatPage'
import { I18nProvider } from '../i18n'
import { hermesApiChat } from '../lib/hermesClient'

vi.mock('../lib/hermesClient', () => ({
  hermesApiChat: vi.fn(),
}))

describe('ChatPage', () => {
  beforeEach(() => {
    window.localStorage.removeItem('clawt.language')
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders starter prompts and the reserved endpoint inventory', () => {
    render(
      <I18nProvider>
        <ChatPage />
      </I18nProvider>,
    )

    const starter = screen.getByRole('button', {
      name: 'Help me understand the current Hermes runtime and what I can do from this desktop app.',
    })

    fireEvent.click(starter)

    expect(screen.getByPlaceholderText('Type a message…')).toHaveValue(
      'Help me understand the current Hermes runtime and what I can do from this desktop app.',
    )
    expect(screen.getByText('/v1/chat/completions')).toBeInTheDocument()
    expect(screen.getAllByText('Chat Core').length).toBeGreaterThan(0)
  })

  it('copies the latest assistant reply and exports the conversation', async () => {
    vi.mocked(hermesApiChat).mockResolvedValueOnce('Here is the assistant reply.')

    Object.defineProperty(URL, 'createObjectURL', {
      value: () => 'blob:initial',
      configurable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: () => undefined,
      configurable: true,
    })

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:chat-export')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    const createElement = vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      if (tagName === 'a') {
        return {
          click: clickSpy,
          set href(_value: string) {},
          set download(_value: string) {},
        } as unknown as HTMLAnchorElement
      }
      return originalCreateElement(tagName)
    }) as typeof document.createElement)

    render(
      <I18nProvider>
        <ChatPage />
      </I18nProvider>,
    )

    fireEvent.change(screen.getByPlaceholderText('Type a message…'), {
      target: { value: 'Summarize the workspace.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByText('Here is the assistant reply.')).toBeInTheDocument()
      expect(screen.getByText('Response received from Hermes desktop proxy.')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Copy last reply' }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Here is the assistant reply.')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Export transcript' }))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledTimes(1)

    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
    createElement.mockRestore()
  })
})
