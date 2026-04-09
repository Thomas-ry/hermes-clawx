import { useCallback, useEffect, useState, type CSSProperties } from 'react'

type SkillRow = { name: string; description?: string; category?: string }
type SkillsListResult = { skills?: SkillRow[] }
type SkillViewResult = {
  success?: boolean
  skill?: {
    name?: string
    description?: string
    category?: string
    content?: string
    files?: string[]
    path?: string
  }
  content?: string
  path?: string
}

const panelStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  padding: 12,
  borderRadius: 12,
}

export function SkillsPage() {
  const [categoriesRaw, setCategoriesRaw] = useState<unknown>(null)
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<SkillViewResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('')

  async function loadSkill(name: string) {
    try {
      setError(null)
      setSelectedSkillName(name)
      const details = (await window.hermes.skills.view({ name })) as SkillViewResult
      setSelectedSkill(details)
    } catch (e) {
      setError(String(e))
    }
  }

  const refresh = useCallback(async (preferredSkillName?: string | null) => {
    try {
      setError(null)
      const cats = await window.hermes.skills.categories()
      setCategoriesRaw(cats)
      const list = (await window.hermes.skills.list(category ? { category } : {})) as SkillsListResult
      const nextSkills = list.skills ?? []
      setSkills(nextSkills)

      const nextSelectedName =
        preferredSkillName && nextSkills.some((skill) => skill.name === preferredSkillName)
          ? preferredSkillName
          : nextSkills[0]?.name ?? null

      if (nextSelectedName) {
        await loadSkill(nextSelectedName)
      } else {
        setSelectedSkillName(null)
        setSelectedSkill(null)
      }
    } catch (e) {
      setError(String(e))
    }
  }, [category])

  useEffect(() => {
    refresh(selectedSkillName)
  }, [refresh, category, selectedSkillName])

  return (
    <div style={{ maxWidth: 1120 }}>
      <h2>Skills</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>Browse installed skills and inspect their `SKILL.md` content.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ opacity: 0.8 }}>Category</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="(optional)" />
        </label>
        <button onClick={() => refresh(selectedSkillName)}>Refresh</button>
      </div>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 1.2fr', gap: 16, marginTop: 16 }}>
        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Categories</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{categoriesRaw ? JSON.stringify(categoriesRaw, null, 2) : 'Loading...'}</pre>
        </div>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Skills ({skills.length})</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {skills.map((skill) => (
              <button
                key={skill.name}
                onClick={() => loadSkill(skill.name)}
                style={{
                  textAlign: 'left',
                  border: skill.name === selectedSkillName ? '1px solid rgba(231, 149, 78, 0.8)' : '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ fontWeight: 600 }}>{skill.name}</div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>{skill.category ?? ''}</div>
                <div style={{ opacity: 0.85, marginTop: 6, whiteSpace: 'pre-wrap' }}>{skill.description ?? ''}</div>
              </button>
            ))}
            {skills.length === 0 ? <div style={{ opacity: 0.7 }}>No skills found.</div> : null}
          </div>
        </div>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Skill Detail</h3>
          {selectedSkill ? (
            <>
              <div style={{ fontWeight: 700 }}>{selectedSkill.skill?.name ?? selectedSkillName}</div>
              <div style={{ opacity: 0.72, fontSize: 12 }}>{selectedSkill.skill?.category ?? ''}</div>
              <div style={{ opacity: 0.8, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {selectedSkill.skill?.description ?? ''}
              </div>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 8 }}>
                Path: {selectedSkill.skill?.path ?? selectedSkill.path ?? '(unknown)'}
              </div>
              {selectedSkill.skill?.files?.length ? (
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
                  Files: {selectedSkill.skill.files.join(', ')}
                </div>
              ) : null}
              <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', maxHeight: 480, overflow: 'auto' }}>
                {selectedSkill.skill?.content ?? selectedSkill.content ?? 'No content returned.'}
              </pre>
            </>
          ) : (
            <div style={{ opacity: 0.7 }}>Pick a skill to view its details.</div>
          )}
        </div>
      </div>
    </div>
  )
}
