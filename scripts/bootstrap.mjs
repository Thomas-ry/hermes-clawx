import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
    ...options,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function commandExists(command, args = ['--version']) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  })

  return result.status === 0
}

console.log('\nHermes ClawX bootstrap\n')

if (!commandExists('node')) {
  console.error('Node.js is required before running bootstrap.')
  process.exit(1)
}

if (!commandExists('pnpm')) {
  console.error('pnpm is required before running bootstrap.')
  process.exit(1)
}

if (!existsSync(path.join(repoRoot, 'node_modules'))) {
  console.log('Installing workspace dependencies...')
  run('pnpm', ['install'])
} else {
  console.log('Workspace dependencies already present, skipping pnpm install.')
}

console.log('Running environment doctor...')
run('pnpm', ['doctor'])

console.log('Preparing bundled Hermes runtime...')
run('pnpm', ['runtime:build'])

console.log('\nBootstrap complete.\n')
console.log('Next steps:')
console.log('  1. Start the desktop app: pnpm dev')
console.log('  2. Or build a package: pnpm package:mac | pnpm package:win | pnpm package:linux')
console.log('  3. Use the Settings page to configure your provider, toolsets, MCP servers, and messaging channels.')
