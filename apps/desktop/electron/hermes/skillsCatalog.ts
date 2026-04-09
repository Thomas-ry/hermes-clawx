import fs from 'node:fs'
import path from 'node:path'

type SkillViewResult = {
  success: boolean
  skill?: {
    name: string
    content: string
    path: string
  }
  error?: string
}

function parseFrontmatterName(content: string, fallbackName: string): string {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
  const nameLine = frontmatter?.[1]
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('name:'))

  return nameLine ? nameLine.replace(/^name:\s*/, '').trim().replace(/^['"]|['"]$/g, '') : fallbackName
}

export function viewSkillMarkdown(hermesHomeDir: string, name: string): SkillViewResult {
  const skillsRoot = path.join(hermesHomeDir, 'skills')
  if (!fs.existsSync(skillsRoot)) {
    return { success: false, error: 'No local skills directory found.' }
  }

  const queue = [skillsRoot]
  while (queue.length > 0) {
    const currentDir = queue.shift()
    if (!currentDir) continue

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        queue.push(fullPath)
        continue
      }

      if (!entry.isFile() || entry.name !== 'SKILL.md') {
        continue
      }

      const content = fs.readFileSync(fullPath, 'utf8')
      const resolvedName = parseFrontmatterName(content, path.basename(path.dirname(fullPath)))
      if (resolvedName !== name) {
        continue
      }

      return {
        success: true,
        skill: {
          name: resolvedName,
          path: fullPath,
          content,
        },
      }
    }
  }

  return { success: false, error: `Skill '${name}' not found in local skills directory.` }
}
