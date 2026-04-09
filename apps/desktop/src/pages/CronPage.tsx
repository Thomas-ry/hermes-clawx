import { useEffect, useState, type CSSProperties } from 'react'

type CronJob = {
  job_id: string
  name: string
  schedule: string
  repeat?: string
  prompt_preview?: string
  next_run_at?: string
  deliver?: string | string[]
  enabled?: boolean
  state?: string
  paused_reason?: string
  script?: string
  skills?: string[]
}

type CronListResult = {
  success?: boolean
  jobs?: CronJob[]
}

const panelStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  padding: 12,
  borderRadius: 12,
}

export function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const [schedule, setSchedule] = useState('every 1h')
  const [prompt, setPrompt] = useState('Write a short daily status note.')
  const [name, setName] = useState('Status Note')
  const [deliver, setDeliver] = useState('local')

  const [editName, setEditName] = useState('')
  const [editSchedule, setEditSchedule] = useState('')
  const [editPrompt, setEditPrompt] = useState('')
  const [editDeliver, setEditDeliver] = useState('local')

  const selectedJob = jobs.find((job) => job.job_id === selectedJobId) ?? null

  async function refresh(preferredJobId?: string | null) {
    try {
      setError(null)
      const result = (await window.hermes.cron.list({ include_disabled: true })) as CronListResult
      const nextJobs = result.jobs ?? []
      setJobs(nextJobs)

      const nextSelectedId =
        preferredJobId && nextJobs.some((job) => job.job_id === preferredJobId)
          ? preferredJobId
          : nextJobs[0]?.job_id ?? null
      setSelectedJobId(nextSelectedId)

      const nextSelected = nextJobs.find((job) => job.job_id === nextSelectedId)
      if (nextSelected) {
        setEditName(nextSelected.name ?? '')
        setEditSchedule(nextSelected.schedule ?? '')
        setEditPrompt(nextSelected.prompt_preview ?? '')
        setEditDeliver(Array.isArray(nextSelected.deliver) ? nextSelected.deliver.join(',') : String(nextSelected.deliver ?? 'local'))
      } else {
        setEditName('')
        setEditSchedule('')
        setEditPrompt('')
        setEditDeliver('local')
      }
    } catch (e) {
      setError(String(e))
    }
  }

  async function createJob() {
    try {
      setBusyAction('create')
      setError(null)
      const created = await window.hermes.cron.create({
        schedule,
        prompt,
        name,
        deliver: [deliver],
      })
      const nextJobId = (created as { job_id?: string }).job_id ?? null
      await refresh(nextJobId)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusyAction(null)
    }
  }

  async function runJobAction(action: 'pause' | 'resume' | 'run' | 'remove', jobId: string) {
    try {
      setBusyAction(`${action}:${jobId}`)
      setError(null)
      await window.hermes.cron[action]({ job_id: jobId })
      await refresh(action === 'remove' ? null : jobId)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusyAction(null)
    }
  }

  async function saveJobEdits() {
    if (!selectedJob) return
    try {
      setBusyAction(`update:${selectedJob.job_id}`)
      setError(null)
      await window.hermes.cron.update({
        job_id: selectedJob.job_id,
        name: editName,
        schedule: editSchedule,
        prompt: editPrompt,
        deliver: editDeliver,
      })
      await refresh(selectedJob.job_id)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusyAction(null)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div style={{ maxWidth: 1120 }}>
      <h2>Cron</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>Create, inspect, update, run, pause, and remove Hermes cron jobs.</p>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 16, marginTop: 16 }}>
        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Create Job</h3>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Schedule</div>
            <input value={schedule} onChange={(e) => setSchedule(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Deliver</div>
            <input value={deliver} onChange={(e) => setDeliver(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Prompt</div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ width: '100%', minHeight: 120 }} />
          </label>
          <button onClick={createJob} disabled={busyAction === 'create'}>
            {busyAction === 'create' ? 'Creating…' : 'Create'}
          </button>
        </div>

        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Jobs</h3>
            <button onClick={() => refresh(selectedJobId)}>Refresh</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {jobs.map((job) => (
              <button
                key={job.job_id}
                onClick={() => {
                  setSelectedJobId(job.job_id)
                  setEditName(job.name ?? '')
                  setEditSchedule(job.schedule ?? '')
                  setEditPrompt(job.prompt_preview ?? '')
                  setEditDeliver(Array.isArray(job.deliver) ? job.deliver.join(',') : String(job.deliver ?? 'local'))
                }}
                style={{
                  textAlign: 'left',
                  border: job.job_id === selectedJobId ? '1px solid rgba(231, 149, 78, 0.8)' : '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ fontWeight: 600 }}>{job.name}</div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>{job.schedule}</div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>
                  {job.state ?? 'scheduled'} {job.next_run_at ? `· next ${job.next_run_at}` : ''}
                </div>
              </button>
            ))}
            {jobs.length === 0 ? <div style={{ opacity: 0.7 }}>No jobs yet.</div> : null}
          </div>
        </div>
      </div>

      <div style={{ ...panelStyle, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Selected Job</h3>
        {selectedJob ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Name</div>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Schedule</div>
                  <input value={editSchedule} onChange={(e) => setEditSchedule(e.target.value)} style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Deliver</div>
                  <input value={editDeliver} onChange={(e) => setEditDeliver(e.target.value)} style={{ width: '100%' }} />
                </label>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Prompt preview</div>
                <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} style={{ width: '100%', minHeight: 130 }} />
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
                  Skills: {selectedJob.skills?.length ? selectedJob.skills.join(', ') : 'none'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                  Script: {selectedJob.script ?? 'none'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                  Repeat: {selectedJob.repeat ?? 'default'}
                </div>
                {selectedJob.paused_reason ? (
                  <div style={{ fontSize: 12, opacity: 0.65 }}>Paused reason: {selectedJob.paused_reason}</div>
                ) : null}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <button onClick={saveJobEdits} disabled={busyAction === `update:${selectedJob.job_id}`}>
                {busyAction === `update:${selectedJob.job_id}` ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={() => runJobAction('run', selectedJob.job_id)} disabled={busyAction === `run:${selectedJob.job_id}`}>
                Run now
              </button>
              {selectedJob.state === 'paused' ? (
                <button onClick={() => runJobAction('resume', selectedJob.job_id)} disabled={busyAction === `resume:${selectedJob.job_id}`}>
                  Resume
                </button>
              ) : (
                <button onClick={() => runJobAction('pause', selectedJob.job_id)} disabled={busyAction === `pause:${selectedJob.job_id}`}>
                  Pause
                </button>
              )}
              <button onClick={() => runJobAction('remove', selectedJob.job_id)} disabled={busyAction === `remove:${selectedJob.job_id}`}>
                Delete
              </button>
            </div>
          </>
        ) : (
          <div style={{ opacity: 0.7 }}>Pick a job to inspect or edit it.</div>
        )}
      </div>
    </div>
  )
}
