import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const runtimeDir = path.join(repoRoot, 'apps', 'desktop', 'resources', 'hermes-agent')
const metadataFile = path.join(runtimeDir, 'BUNDLED_RUNTIME.json')

if (!existsSync(runtimeDir) || !existsSync(metadataFile)) {
  console.error('Bundled Hermes runtime not found.')
  console.error(`Expected: ${runtimeDir}`)
  console.error('Run `pnpm runtime:build` before packaging.')
  process.exit(1)
}

console.log(`Runtime ready: ${runtimeDir}`)
