import { useMemo, useState } from 'react'
import { hermesApiChat } from '../lib/hermesClient'
import { useI18n } from '../i18n'
import { getChatRoleLabel, type ChatRole } from '../lib/chatRole'

type ChatMsg = { role: ChatRole; content: string }

export function ChatPage() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'system', content: 'You are Hermes Agent.' },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visibleMessages = useMemo(() => messages.filter((message) => message.role !== 'system'), [messages])

  async function send() {
    const text = draft.trim()
    if (!text || busy) return
    setDraft('')
    setError(null)
    const nextMessages = [...messages, { role: 'user', content: text } as const]
    setMessages(nextMessages)
    setBusy(true)
    try {
      const reply = await hermesApiChat({ messages: nextMessages })
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('chat.title')}</h2>
        <p className="page-description">{t('chat.description')}</p>
      </div>

      <div className="ui-card">
        <div className="ui-card-body" style={{ display: 'grid', gap: 16 }}>
          <div
            className="ui-surface"
            style={{
              minHeight: 420,
              maxHeight: 'calc(100vh - 330px)',
              overflow: 'auto',
              display: 'grid',
              gap: 14,
              alignContent: 'start',
            }}
          >
            {visibleMessages.map((message, index) => (
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
                  style={{
                    maxWidth: '78%',
                    padding: '14px 16px',
                    borderRadius: 18,
                    background:
                      message.role === 'user'
                        ? 'linear-gradient(180deg, rgba(124, 140, 255, 0.28), rgba(124, 140, 255, 0.14))'
                        : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {busy ? <div className="ui-meta">{t('chat.thinking')}</div> : null}
            {error ? <div className="ui-status-error">{error}</div> : null}
          </div>

          <div className="ui-card-soft" style={{ padding: 14 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('chat.placeholder')}
                style={{ minHeight: 110 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="ui-meta">{t('chat.tip')}</div>
                <button onClick={send} disabled={busy || !draft.trim()}>
                  {t('chat.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
