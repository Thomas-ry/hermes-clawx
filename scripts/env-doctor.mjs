import { spawnSync } from 'node:child_process'

const probes = [
  { id: 'node', command: 'node', args: ['--version'] },
  { id: 'pnpm', command: 'pnpm', args: ['--version'] },
  { id: 'python3', command: 'python3', args: ['--version'] },
  { id: 'uv', command: 'uv', args: ['--version'] },
  { id: 'docker', command: 'docker', args: ['--version'] },
  { id: 'ollama', command: 'ollama', args: ['--version'] },
  { id: 'git', command: 'git', args: ['--version'] },
]

const results = probes.map((probe) => {
  const outcome = spawnSync(probe.command, probe.args, {
    encoding: 'utf8',
    shell: false,
  })

  if (outcome.error) {
    return {
      id: probe.id,
      ok: false,
      detail: outcome.error.message,
    }
  }

  return {
    id: probe.id,
    ok: outcome.status === 0,
    detail: `${outcome.stdout || outcome.stderr}`.trim(),
  }
})

console.log(JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2))
