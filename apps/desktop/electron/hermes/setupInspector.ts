import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import type { HermesRuntimePaths } from './runtimePaths'

type ProbeResult = {
  id: string
  label: string
  ok: boolean
  detail: string
}

function probeCommand(id: string, label: string, command: string, args: string[] = ['--version']): ProbeResult {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
  })

  if (result.error) {
    return {
      id,
      label,
      ok: false,
      detail: result.error.message,
    }
  }

  return {
    id,
    label,
    ok: result.status === 0,
    detail: `${result.stdout || result.stderr}`.trim() || `${command} exited with status ${String(result.status ?? 'unknown')}`,
  }
}

export function inspectLocalSetup(runtime: HermesRuntimePaths) {
  const probes: ProbeResult[] = [
    probeCommand('node', 'Node.js', 'node'),
    probeCommand('pnpm', 'pnpm', 'pnpm'),
    probeCommand('python3', 'Python', 'python3'),
    probeCommand('uv', 'uv', 'uv'),
    probeCommand('docker', 'Docker', 'docker'),
    probeCommand('ollama', 'Ollama', 'ollama'),
    probeCommand('git', 'Git', 'git'),
    {
      id: 'runtime-dir',
      label: 'Bundled Hermes runtime',
      ok: existsSync(runtime.hermesInstallDir),
      detail: runtime.hermesInstallDir,
    },
    {
      id: 'runtime-python',
      label: 'Bundled runtime Python',
      ok: existsSync(runtime.pythonExe),
      detail: runtime.pythonExe,
    },
    {
      id: 'hermes-home',
      label: 'Hermes home directory',
      ok: existsSync(runtime.hermesHomeDir),
      detail: runtime.hermesHomeDir,
    },
  ]

  return {
    checkedAt: new Date().toISOString(),
    ok: probes.every((probe) => probe.ok),
    probes,
  }
}
