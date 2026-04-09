type JsonRecord = Record<string, unknown>

function normalizeNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.map((item) => String(item ?? '').trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  )
}

function getSkillsConfig(config: JsonRecord): JsonRecord {
  const skills = config.skills
  return typeof skills === 'object' && skills !== null ? (skills as JsonRecord) : {}
}

function getPlatformDisabled(skillsConfig: JsonRecord): JsonRecord {
  const platformDisabled = skillsConfig.platform_disabled
  return typeof platformDisabled === 'object' && platformDisabled !== null ? (platformDisabled as JsonRecord) : {}
}

export function getDisabledSkills(config: JsonRecord, platform?: string | null): string[] {
  const skillsConfig = getSkillsConfig(config)
  const globalDisabled = normalizeNames(skillsConfig.disabled)

  if (!platform) {
    return globalDisabled
  }

  const platformDisabled = getPlatformDisabled(skillsConfig)[platform]
  if (platformDisabled === undefined) {
    return globalDisabled
  }

  return normalizeNames(platformDisabled)
}

export function saveDisabledSkills(config: JsonRecord, disabled: string[], platform?: string | null): JsonRecord {
  const skillsConfig = getSkillsConfig(config)
  const nextDisabled = normalizeNames(disabled)

  if (!platform) {
    return {
      ...config,
      skills: {
        ...skillsConfig,
        disabled: nextDisabled,
      },
    }
  }

  const platformDisabled = getPlatformDisabled(skillsConfig)
  return {
    ...config,
    skills: {
      ...skillsConfig,
      platform_disabled: {
        ...platformDisabled,
        [platform]: nextDisabled,
      },
    },
  }
}
