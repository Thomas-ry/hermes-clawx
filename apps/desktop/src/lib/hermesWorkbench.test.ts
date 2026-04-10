import { describe, expect, it } from 'vitest'
import {
  apiEndpointCatalog,
  countConfiguredFields,
  createDefaultVisualClientConfig,
  normalizeVisualClientConfig,
  providerCatalog,
  toolCatalog,
} from './hermesWorkbench'

describe('hermesWorkbench', () => {
  it('ships a broad provider and tool catalog', () => {
    expect(providerCatalog.length).toBeGreaterThanOrEqual(12)
    expect(toolCatalog.length).toBeGreaterThanOrEqual(40)
    expect(apiEndpointCatalog.map((endpoint) => endpoint.path)).toEqual(
      expect.arrayContaining(['/health', '/v1/models', '/v1/chat/completions', '/v1/toolsets', '/v1/skills', '/v1/memory', '/v1/cronjobs']),
    )
  })

  it('normalizes partial configs onto the desktop defaults', () => {
    const config = normalizeVisualClientConfig({
      model: 'openrouter/auto',
      terminal: { backend: 'docker', timeout: 240, cwd: '/workspace' },
      visualClient: {
        connection: { apiKey: 'secret', gatewayPort: 8080 },
        session: { sessionName: 'Workspace chat', stream: false },
      },
    })

    expect(config.model).toBe('openrouter/auto')
    expect(config.terminal).toEqual({
      backend: 'docker',
      timeout: 240,
      cwd: '/workspace',
      target: 'workspace',
    })
    expect(config.visualClient.connection.baseUrl).toBe('http://127.0.0.1:3000/v1')
    expect(config.visualClient.connection.apiKey).toBe('secret')
    expect(config.visualClient.connection.gatewayPort).toBe(8080)
    expect(config.visualClient.session.stream).toBe(false)
    expect(config.visualClient.session.sessionName).toBe('Workspace chat')
    expect(config.visualClient.providers).toHaveLength(providerCatalog.length)
    expect(config.visualClient.toolsets.length).toBeGreaterThan(0)
  })

  it('counts configured fields from the default install profile', () => {
    expect(countConfiguredFields(createDefaultVisualClientConfig())).toBeGreaterThan(5)
  })
})
