import { describe, expect, it } from 'vitest'
import { getDisabledSkills, saveDisabledSkills } from './skillsConfig'

describe('skillsConfig', () => {
  it('returns platform override when present', () => {
    const config = {
      skills: {
        disabled: ['alpha', 'beta'],
        platform_disabled: {
          telegram: ['gamma'],
        },
      },
    }

    expect(getDisabledSkills(config, 'telegram')).toEqual(['gamma'])
    expect(getDisabledSkills(config, 'discord')).toEqual(['alpha', 'beta'])
    expect(getDisabledSkills(config)).toEqual(['alpha', 'beta'])
  })

  it('saves disabled skills immutably for a platform scope', () => {
    const original = {
      skills: {
        disabled: ['alpha'],
        platform_disabled: {
          telegram: ['beta'],
        },
      },
      model: 'openai/gpt-5.3-codex',
    }

    const next = saveDisabledSkills(original, ['delta', 'beta'], 'telegram')

    expect(next).toEqual({
      skills: {
        disabled: ['alpha'],
        platform_disabled: {
          telegram: ['beta', 'delta'],
        },
      },
      model: 'openai/gpt-5.3-codex',
    })
    expect(original).toEqual({
      skills: {
        disabled: ['alpha'],
        platform_disabled: {
          telegram: ['beta'],
        },
      },
      model: 'openai/gpt-5.3-codex',
    })
  })
})
