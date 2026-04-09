import fs from 'node:fs'
import path from 'node:path'

export type CronOutputSummary = {
  fileName: string
  path: string
}

export type CronOutputFile = CronOutputSummary & {
  content: string
}

function outputRoot(hermesHomeDir: string): string {
  return path.join(hermesHomeDir, 'cron', 'output')
}

function assertSafeSegment(value: string, label: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed.includes('..') || path.isAbsolute(trimmed) || trimmed.includes(path.sep)) {
    throw new Error(`Invalid ${label}`)
  }
  return trimmed
}

function resolveOutputPath(hermesHomeDir: string, jobId: string, relativePath: string): string {
  const root = outputRoot(hermesHomeDir)
  const safeJobId = assertSafeSegment(jobId, 'cron job id')
  const resolvedRoot = path.resolve(root, safeJobId)
  const resolvedPath = path.resolve(root, relativePath)

  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error('Invalid cron output path')
  }

  if (!resolvedPath.endsWith('.md')) {
    throw new Error('Invalid cron output path')
  }

  return resolvedPath
}

export function listCronOutputs(hermesHomeDir: string, jobId: string): { success: true; files: CronOutputSummary[] } {
  const safeJobId = assertSafeSegment(jobId, 'cron job id')
  const jobDir = path.join(outputRoot(hermesHomeDir), safeJobId)

  if (!fs.existsSync(jobDir)) {
    return { success: true, files: [] }
  }

  const files = fs
    .readdirSync(jobDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => ({
      fileName: entry.name,
      path: `${safeJobId}/${entry.name}`,
    }))
    .sort((left, right) => right.fileName.localeCompare(left.fileName))

  return { success: true, files }
}

export function readCronOutput(
  hermesHomeDir: string,
  jobId: string,
  relativePath: string,
): { success: true; file: CronOutputFile } {
  const safePath = resolveOutputPath(hermesHomeDir, jobId, relativePath)
  const fileName = path.basename(safePath)
  const content = fs.readFileSync(safePath, 'utf8')

  return {
    success: true,
    file: {
      fileName,
      path: `${assertSafeSegment(jobId, 'cron job id')}/${fileName}`,
      content,
    },
  }
}
