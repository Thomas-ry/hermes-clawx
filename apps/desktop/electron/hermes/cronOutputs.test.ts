import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { listCronOutputs, readCronOutput } from './cronOutputs'

const tempDirs: string[] = []

afterEach(() => {
  while (tempDirs.length) {
    fs.rmSync(tempDirs.pop()!, { recursive: true, force: true })
  }
})

function createHermesHome(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawt-cron-'))
  tempDirs.push(dir)
  return dir
}

describe('cronOutputs', () => {
  it('lists markdown outputs newest first', () => {
    const hermesHomeDir = createHermesHome()
    const outputDir = path.join(hermesHomeDir, 'cron', 'output', 'job-123')
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(path.join(outputDir, '2026-04-08_09-00-00.md'), '# older')
    fs.writeFileSync(path.join(outputDir, '2026-04-09_10-00-00.md'), '# newer')
    fs.writeFileSync(path.join(outputDir, 'ignore.txt'), 'skip me')

    expect(listCronOutputs(hermesHomeDir, 'job-123')).toEqual({
      success: true,
      files: [
        {
          fileName: '2026-04-09_10-00-00.md',
          path: 'job-123/2026-04-09_10-00-00.md',
        },
        {
          fileName: '2026-04-08_09-00-00.md',
          path: 'job-123/2026-04-08_09-00-00.md',
        },
      ],
    })
  })

  it('reads a single cron output and blocks path traversal', () => {
    const hermesHomeDir = createHermesHome()
    const outputDir = path.join(hermesHomeDir, 'cron', 'output', 'job-123')
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(path.join(outputDir, '2026-04-09_10-00-00.md'), '# report')

    expect(readCronOutput(hermesHomeDir, 'job-123', 'job-123/2026-04-09_10-00-00.md')).toEqual({
      success: true,
      file: {
        fileName: '2026-04-09_10-00-00.md',
        path: 'job-123/2026-04-09_10-00-00.md',
        content: '# report',
      },
    })

    expect(() => readCronOutput(hermesHomeDir, 'job-123', '../secrets.txt')).toThrow('Invalid cron output path')
  })
})
