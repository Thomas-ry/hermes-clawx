import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { BrainIcon } from '../components/icons'

type MemoryArtifact = {
  id: string
  title: string
  source: string
  summary: string
}

const MEMORY_ARTIFACTS: MemoryArtifact[] = [
  {
    id: 'memory-md',
    title: 'MEMORY.md',
    source: 'workspace memory',
    summary: 'Persistent long-term notes, project conventions, and agent-relevant reminders.',
  },
  {
    id: 'user-md',
    title: 'USER.md',
    source: 'user profile',
    summary: 'Operator preferences, deployment defaults, and installation shortcuts.',
  },
  {
    id: 'session-search',
    title: 'Cross-session search',
    source: '/v1/memory',
    summary: 'Reserve search across prior sessions, summaries, and imported OpenClaw state.',
  },
  {
    id: 'openclaw-import',
    title: 'OpenClaw migration',
    source: 'one-click import',
    summary: 'Import SOUL.md, memories, skills, API keys, and session metadata into Hermes desktop.',
  },
]

export function MemoryPage() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(MEMORY_ARTIFACTS[0]?.id ?? '')

  const visibleArtifacts = useMemo(() => {
    if (!query.trim()) return MEMORY_ARTIFACTS
    const normalized = query.trim().toLowerCase()
    return MEMORY_ARTIFACTS.filter((artifact) =>
      `${artifact.title} ${artifact.source} ${artifact.summary}`.toLowerCase().includes(normalized),
    )
  }, [query])

  const selectedArtifact =
    visibleArtifacts.find((artifact) => artifact.id === selectedId) ??
    visibleArtifacts[0] ??
    null

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">Memory</h2>
        <p className="page-description">
          Manage the Hermes visual client memory surfaces: `MEMORY.md`, `USER.md`, cross-session search, and OpenClaw migration inputs.
        </p>
      </div>

      <div className="ui-grid" style={{ gridTemplateColumns: '0.8fr 1.2fr' }}>
        <section className="ui-card">
          <div className="ui-card-body">
            <h3 className="ui-card-title">Memory index</h3>
            <label className="ui-label" style={{ marginTop: 18 }}>
              <div className="ui-label-text">Search memory surfaces</div>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="memory, SOUL, session, skills…" />
            </label>
            <div style={{ display: 'grid', gap: 12 }}>
              {visibleArtifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  type="button"
                  className={`ui-list-button ${artifact.id === selectedArtifact?.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedId(artifact.id)}
                >
                  <div style={{ fontWeight: 700 }}>{artifact.title}</div>
                  <div className="ui-meta" style={{ marginTop: 6 }}>{artifact.source}</div>
                </button>
              ))}
              {visibleArtifacts.length === 0 ? (
                <EmptyState
                  icon={<BrainIcon width={20} height={20} />}
                  title="No memory surfaces match"
                  description="Try a broader keyword to locate the memory or migration surface you want to configure."
                />
              ) : null}
            </div>
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card-body">
            {selectedArtifact ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{selectedArtifact.title}</h3>
                <div className="ui-pill">{selectedArtifact.source}</div>
                <p className="ui-card-description">{selectedArtifact.summary}</p>
                <div className="settings-endpoint-list">
                  <div className="chat-endpoint-item">
                    <div className="ui-code">/v1/memory</div>
                    <div className="ui-meta">GET · search memory, summaries, and imported OpenClaw data.</div>
                  </div>
                  <div className="chat-endpoint-item">
                    <div className="ui-code">MEMORY.md / USER.md</div>
                    <div className="ui-meta">Editable from desktop settings and reserved for future inline editing.</div>
                  </div>
                  <div className="chat-endpoint-item">
                    <div className="ui-code">SOUL.md Import</div>
                    <div className="ui-meta">One-click migration slot for OpenClaw-compatible memory payloads.</div>
                  </div>
                </div>
                <div className="ui-surface">
                  <div className="ui-card-title" style={{ marginBottom: 12 }}>Migration checklist</div>
                  <div className="ui-meta">1. Import SOUL.md and any MEMORY.md / USER.md files.</div>
                  <div className="ui-meta">2. Map API keys into the provider center.</div>
                  <div className="ui-meta">3. Re-enable matching skills and tool presets.</div>
                  <div className="ui-meta">4. Reconnect cron jobs and messaging channels.</div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<BrainIcon width={20} height={20} />}
                title="Pick a memory surface"
                description="Select a memory item from the left to inspect the reserved interfaces and migration checklist."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
