import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ChatIcon } from '../components/icons'
import { useI18n } from '../i18n'
import { hermesApiChat } from '../lib/hermesClient'
import {
  apiEndpointCatalog,
  providerCatalog,
  toolPresets,
} from '../lib/hermesWorkbench'
import { getChatRoleLabel, type ChatRole } from '../lib/chatRole'

type ChatMsg = { role: ChatRole; content: string }
type TimelineEvent = { id: string; text: string }

export function ChatPage() {
  const { t } = useI18n()
  const starterPrompts = [
    t('chat.starterPromptArchitecture'),
    t('chat.starterPromptCron'),
    t('chat.starterPromptSkills'),
  ]
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'system', content: 'You are Hermes Agent.' },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [providerId, setProviderId] = useState(providerCatalog[0]?.id ?? 'openrouter')
  const [model, setModel] = useState('nous/hermes-agent')
  const [toolPresetId, setToolPresetId] = useState(toolPresets[0]?.id ?? 'chat-core')
  const [stream, setStream] = useState(true)
  const [sessionName, setSessionName] = useState('Desktop default session')
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: 'ready', text: 'Desktop proxy ready. Configure provider, model, tool preset, and session details before you send.' },
  ])

  const visibleMessages = useMemo(() => messages.filter((message) => message.role !== 'system'), [messages])
  const lastAssistantMessage = [...visibleMessages].reverse().find((message) => message.role === 'assistant') ?? null
  const selectedPreset = toolPresets.find((preset) => preset.id === toolPresetId) ?? toolPresets[0]
  const selectedProvider = providerCatalog.find((provider) => provider.id === providerId) ?? providerCatalog[0]

  async function send() {
    const text = draft.trim()
    if (!text || busy) return

    const nextMessages = [...messages, { role: 'user', content: text } as const]
    setMessages(nextMessages)
    setDraft('')
    setError(null)
    setInfoMessage(null)
    setBusy(true)
    setTimeline([
      { id: 'request', text: 'POST /v1/chat/completions reserved for SSE-compatible chat requests.' },
      { id: 'provider', text: `Provider: ${selectedProvider.label} via ${selectedProvider.baseUrl}` },
      { id: 'preset', text: `Tool preset: ${selectedPreset.label} (${selectedPreset.toolIds.length} tools preselected).` },
      { id: 'session', text: `Session: ${sessionName || 'Unnamed session'} | Streaming SSE: ${stream ? 'enabled' : 'disabled'}.` },
    ])

    try {
      const reply = await hermesApiChat({
        model,
        stream: false,
        messages: nextMessages,
        metadata: {
          provider: providerId,
          toolPreset: toolPresetId,
          sessionName,
          requestedStream: stream,
        },
      })
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
      setTimeline((current) => [
        ...current,
        { id: 'response', text: 'Response received from Hermes desktop proxy.' },
      ])
    } catch (eventualError) {
      setError(String(eventualError))
    } finally {
      setBusy(false)
    }
  }

  function clearConversation() {
    setMessages([{ role: 'system', content: 'You are Hermes Agent.' }])
    setDraft('')
    setError(null)
    setInfoMessage(null)
    setTimeline([{ id: 'ready', text: 'Conversation cleared. Endpoint reservations and provider wiring stay intact.' }])
  }

  function applyStarterPrompt(prompt: string) {
    setDraft(prompt)
    setError(null)
  }

  async function copyLastReply() {
    if (!lastAssistantMessage) return

    try {
      await navigator.clipboard.writeText(lastAssistantMessage.content)
      setInfoMessage(t('chat.copySuccess'))
    } catch (copyError) {
      setError(`${t('chat.copyFailed')}: ${String(copyError)}`)
    }
  }

  function exportTranscript() {
    const transcript = visibleMessages
      .map((message) => `${getChatRoleLabel(message.role, t)}\n${message.content}`)
      .join('\n\n')

    const blob = new Blob([`${transcript}\n`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'hermes-clawx-chat-transcript.txt'
    anchor.click()
    URL.revokeObjectURL(url)
    setInfoMessage(t('chat.exported'))
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('chat.title')}</h2>
        <p className="page-description">{t('chat.description')}</p>
      </div>

      <div className="chat-workbench">
        <section className="ui-card">
          <div className="ui-card-body">
            <div className="chat-toolbar">
              <div className="ui-toolbar">
                <span className="ui-pill">{t('chat.localGateway')}</span>
                <span className="ui-pill">{t(`chat.sessionCount|${visibleMessages.length}`)}</span>
                <span className="ui-pill">{selectedProvider.label}</span>
                <span className="ui-pill">{selectedPreset.label}</span>
              </div>
              <div className="ui-toolbar">
                <button onClick={copyLastReply} disabled={!lastAssistantMessage}>
                  {t('chat.copyLastReply')}
                </button>
                <button onClick={exportTranscript} disabled={visibleMessages.length === 0}>
                  {t('chat.exportTranscript')}
                </button>
                <button onClick={clearConversation} disabled={busy && visibleMessages.length === 0}>
                  {t('chat.clearConversation')}
                </button>
              </div>
            </div>

            <div className="chat-message-surface">
              {visibleMessages.length === 0 ? (
                <>
                  <EmptyState
                    icon={<ChatIcon width={20} height={20} />}
                    title={t('chat.emptyTitle')}
                    description={t('chat.emptyDescription')}
                  />
                  <section className="chat-starter-section" aria-label={t('chat.starterTitle')}>
                    <div className="chat-starter-header">
                      <div className="ui-card-title">{t('chat.starterTitle')}</div>
                      <div className="ui-meta">{t('chat.tip')}</div>
                    </div>
                    <div className="chat-starter-grid">
                      {starterPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="chat-starter-button"
                          onClick={() => applyStarterPrompt(prompt)}
                          disabled={busy}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                visibleMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    style={{
                      display: 'grid',
                      gap: 8,
                      justifyItems: message.role === 'user' ? 'end' : 'start',
                    }}
                  >
                    <span className="ui-pill">{getChatRoleLabel(message.role, t)}</span>
                    <div
                      className={`chat-bubble ${message.role === 'user' ? 'user' : 'assistant'}`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {busy ? <div className="ui-meta">{t('chat.thinking')}</div> : null}
              {infoMessage ? <div className="ui-status-success">{infoMessage}</div> : null}
              {error ? <div className="ui-status-error">{error}</div> : null}
            </div>

            <div className="ui-card-soft chat-composer-card">
              <div className="chat-composer-grid">
                <textarea
                  aria-label="Chat input"
                  className="chat-composer-textarea"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={t('chat.placeholder')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) send()
                  }}
                />
                <div className="chat-composer-footer">
                  <div className="ui-meta">{t('chat.tip')}</div>
                  <button onClick={send} disabled={busy || !draft.trim()}>
                    {t('chat.send')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="chat-side-rail">
          <section className="ui-card">
            <div className="ui-card-body">
              <h3 className="ui-card-title">Session Profile</h3>
              <p className="ui-card-description">Reserve all the knobs we need for a foolproof Hermes visual client.</p>
              <div className="chat-side-grid">
                <label className="ui-label">
                  <div className="ui-label-text">Provider</div>
                  <select value={providerId} onChange={(event) => setProviderId(event.target.value)}>
                    {providerCatalog.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">Model</div>
                  <input value={model} onChange={(event) => setModel(event.target.value)} />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">Tool preset</div>
                  <select value={toolPresetId} onChange={(event) => setToolPresetId(event.target.value)}>
                    {toolPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">Session name</div>
                  <input value={sessionName} onChange={(event) => setSessionName(event.target.value)} />
                </label>
                <label className="chat-checkbox">
                  <input
                    aria-label="Streaming SSE"
                    type="checkbox"
                    checked={stream}
                    onChange={(event) => setStream(event.target.checked)}
                  />
                  <span>Streaming SSE</span>
                </label>
              </div>
              <div className="ui-meta">
                Current preset tools: {selectedPreset.toolIds.join(', ')}
              </div>
            </div>
          </section>

          <section className="ui-card">
            <div className="ui-card-body">
              <h3 className="ui-card-title">Request Timeline</h3>
              <div className="chat-event-list">
                {timeline.map((item) => (
                  <div key={item.id} className="chat-event-item">
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="ui-card">
            <div className="ui-card-body">
              <h3 className="ui-card-title">Reserved APIs</h3>
              <div className="chat-endpoint-list">
                {apiEndpointCatalog.map((endpoint) => (
                  <div key={`${endpoint.method}-${endpoint.path}`} className="chat-endpoint-item">
                    <div className="ui-code">{endpoint.path}</div>
                    <div className="ui-meta">{endpoint.method} · {endpoint.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
