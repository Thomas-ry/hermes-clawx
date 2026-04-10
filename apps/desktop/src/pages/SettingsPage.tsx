import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import {
  apiEndpointCatalog,
  countConfiguredFields,
  envProbeCatalog,
  normalizeVisualClientConfig,
  providerCatalog,
  terminalBackendCatalog,
  toolCatalog,
  toolPresets,
  type VisualClientConfig,
} from '../lib/hermesWorkbench'

type SettingsTabId =
  | 'general'
  | 'connection'
  | 'providers'
  | 'tools'
  | 'mcp'
  | 'terminal'
  | 'automation'
  | 'packaging'

const SETTINGS_TABS: Array<{ id: SettingsTabId; labelKey: string }> = [
  { id: 'general', labelKey: 'settings.tabsGeneral' },
  { id: 'connection', labelKey: 'settings.tabsConnection' },
  { id: 'providers', labelKey: 'settings.tabsProviders' },
  { id: 'tools', labelKey: 'settings.tabsTools' },
  { id: 'mcp', labelKey: 'settings.tabsMcp' },
  { id: 'terminal', labelKey: 'settings.tabsTerminal' },
  { id: 'automation', labelKey: 'settings.tabsAutomation' },
  { id: 'packaging', labelKey: 'settings.tabsPackaging' },
]

export function SettingsPage() {
  const { language, setLanguage, t } = useI18n()
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [config, setConfig] = useState<VisualClientConfig>(normalizeVisualClientConfig({}))
  const [activeTab, setActiveTab] = useState<SettingsTabId>('connection')

  const fieldCount = countConfiguredFields(config)
  const maxTurnsValue = Number(config.agent.max_turns)
  const timeoutValue = Number(config.terminal.timeout)
  const gatewayPortValue = Number(config.visualClient.connection.gatewayPort)
  const concurrencyValue = Number(config.visualClient.cron.concurrency)

  const validationErrors = useMemo(() => [
    !Number.isFinite(maxTurnsValue) || !Number.isInteger(maxTurnsValue)
      ? t('settings.validationMaxTurnsInteger')
      : maxTurnsValue < 1
        ? t('settings.validationMaxTurnsMin')
        : null,
    !Number.isFinite(timeoutValue) || !Number.isInteger(timeoutValue)
      ? t('settings.validationTimeoutInteger')
      : timeoutValue < 1
        ? t('settings.validationTimeoutMin')
        : null,
    !Number.isFinite(gatewayPortValue) || !Number.isInteger(gatewayPortValue) || gatewayPortValue < 1
      ? 'Gateway port must be a positive integer.'
      : null,
    !Number.isFinite(concurrencyValue) || !Number.isInteger(concurrencyValue) || concurrencyValue < 1
      ? 'Cron concurrency must be at least 1.'
      : null,
  ].filter((value): value is string => Boolean(value)), [concurrencyValue, gatewayPortValue, maxTurnsValue, t, timeoutValue])
  const hasValidationErrors = validationErrors.length > 0

  const updateConfig = useCallback((updater: (current: VisualClientConfig) => VisualClientConfig) => {
    setConfig((current) => updater(current))
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const next = await window.hermes.config.get()
      setConfig(normalizeVisualClientConfig(next))
    } catch (loadError) {
      setError(String(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function save() {
    if (hasValidationErrors) {
      setSaved(null)
      setError(validationErrors.join('\n'))
      return
    }

    try {
      setError(null)
      setSaved(null)
      await window.hermes.config.save(config as unknown as Record<string, unknown>)
      setSaved(t('settings.saved'))
    } catch (saveError) {
      setError(String(saveError))
    }
  }

  function exportConfig() {
    try {
      setError(null)
      setSaved(null)
      const blob = new Blob([`${JSON.stringify(config, null, 2)}\n`], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'hermes-clawx-config.json'
      anchor.click()
      URL.revokeObjectURL(url)
      setSaved(t('settings.exported'))
    } catch (exportError) {
      setError(String(exportError))
    }
  }

  async function importConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setSaved(null)
      const raw = await file.text()
      const parsed = JSON.parse(raw) as Record<string, unknown>
      setConfig(normalizeVisualClientConfig(parsed))
      setSaved(t('settings.importLoaded'))
    } catch (importError) {
      setError(`${t('settings.importFailed')}: ${String(importError)}`)
    } finally {
      event.target.value = ''
    }
  }

  function toggleProvider(providerId: string, checked: boolean) {
    updateConfig((current) => ({
      ...current,
      visualClient: {
        ...current.visualClient,
        providers: current.visualClient.providers.map((provider) =>
          provider.id === providerId ? { ...provider, enabled: checked } : provider,
        ),
      },
    }))
  }

  function updateProviderField(providerId: string, field: 'baseUrl' | 'apiKeyEnv' | 'defaultModel', value: string) {
    updateConfig((current) => ({
      ...current,
      visualClient: {
        ...current.visualClient,
        providers: current.visualClient.providers.map((provider) =>
          provider.id === providerId ? { ...provider, [field]: value } : provider,
        ),
      },
    }))
  }

  function toggleToolPreset(presetId: string, checked: boolean) {
    updateConfig((current) => ({
      ...current,
      visualClient: {
        ...current.visualClient,
        toolsets: current.visualClient.toolsets.map((preset) =>
          preset.id === presetId ? { ...preset, enabled: checked } : preset,
        ),
      },
    }))
  }

  function updateMcpServer(index: number, field: 'enabled' | 'transport' | 'command' | 'url', value: boolean | string) {
    updateConfig((current) => ({
      ...current,
      visualClient: {
        ...current.visualClient,
        mcpServers: current.visualClient.mcpServers.map((server, serverIndex) =>
          serverIndex === index ? { ...server, [field]: value } : server,
        ),
      },
    }))
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('settings.title')}</h2>
        <p className="page-description">{t('settings.description')} <span className="ui-code">config.yaml</span>.</p>
      </div>

      {error ? <div className="ui-status-error">{error}</div> : null}
      {saved ? <div className="ui-status-success" style={{ marginTop: error ? 12 : 0 }}>{saved}</div> : null}

      <section className="ui-card" style={{ marginTop: 18, marginBottom: 18 }}>
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 className="ui-card-title">{t('settings.overviewTitle2')}</h3>
              <p className="ui-card-description">
                {t('settings.overviewDesc2')}
              </p>
            </div>
            <div className="ui-toolbar">
              <span className="ui-pill">{t(`settings.languagePill|${language}`)}</span>
              <span className="ui-pill">{t(`settings.fieldCount|${fieldCount}`)}</span>
              <span className="ui-pill">Providers: {config.visualClient.providers.filter((provider) => provider.enabled).length}</span>
            </div>
          </div>

          <div className="settings-tab-list">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`settings-tab-button ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="settings-layout">
        <section className="ui-card">
          <div className="ui-card-body">
            {activeTab === 'general' ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{t('settings.tabGeneralDefaults')}</h3>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.languageTitle')}</div>
                  <select value={language} onChange={(event) => setLanguage(event.target.value as 'en' | 'zh')}>
                    <option value="en">{t('app.english')}</option>
                    <option value="zh">{t('app.chinese')}</option>
                  </select>
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabGeneralDefaultModel')}</div>
                  <input
                    aria-label={t('settings.tabGeneralDefaultModel')}
                    value={config.model}
                    onChange={(event) => updateConfig((current) => ({ ...current, model: event.target.value }))}
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabGeneralPlanningMode')}</div>
                  <select
                    value={config.agent.planning_mode}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        agent: { ...current.agent, planning_mode: event.target.value as VisualClientConfig['agent']['planning_mode'] },
                      }))
                    }
                  >
                    <option value="fast">{t('settings.tabGeneralPlanningFast')}</option>
                    <option value="balanced">{t('settings.tabGeneralPlanningBalanced')}</option>
                    <option value="deep">{t('settings.tabGeneralPlanningDeep')}</option>
                  </select>
                </label>
                <label className="chat-checkbox">
                  <input
                    type="checkbox"
                    checked={config.agent.subagents_enabled}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        agent: { ...current.agent, subagents_enabled: event.target.checked },
                      }))
                    }
                  />
                  <span>{t('settings.tabGeneralSubagents')}</span>
                </label>
              </div>
            ) : null}

            {activeTab === 'connection' ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{t('settings.tabConnectionTitle')}</h3>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabConnectionBaseUrl')}</div>
                  <input
                    aria-label={t('settings.tabConnectionBaseUrl')}
                    value={config.visualClient.connection.baseUrl}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          connection: { ...current.visualClient.connection, baseUrl: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabConnectionApiKey')}</div>
                  <input
                    aria-label={t('settings.tabConnectionApiKey')}
                    type="password"
                    value={config.visualClient.connection.apiKey}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          connection: { ...current.visualClient.connection, apiKey: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabConnectionGatewayPort')}</div>
                  <input
                    aria-label={t('settings.tabConnectionGatewayPort')}
                    value={String(config.visualClient.connection.gatewayPort)}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          connection: { ...current.visualClient.connection, gatewayPort: Number(event.target.value || 0) },
                        },
                      }))
                    }
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabConnectionHealthPath')}</div>
                  <input
                    value={config.visualClient.connection.healthPath}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          connection: { ...current.visualClient.connection, healthPath: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
              </div>
            ) : null}

            {activeTab === 'providers' ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{t('settings.tabProvidersTitle')}</h3>
                <div className="settings-provider-grid">
                  {providerCatalog.map((provider) => {
                    const savedProvider = config.visualClient.providers.find((item) => item.id === provider.id)
                    if (!savedProvider) return null

                    return (
                      <section key={provider.id} className="ui-card-soft settings-provider-card">
                        <label className="chat-checkbox">
                          <input
                            type="checkbox"
                            checked={savedProvider.enabled}
                            onChange={(event) => toggleProvider(provider.id, event.target.checked)}
                          />
                          <span>{provider.label}</span>
                        </label>
                        <div className="ui-meta">
                          {t('settings.tabProvidersStreaming')}: {provider.supportsStreaming ? 'yes' : 'no'} · {t('settings.tabProvidersVision')}: {provider.supportsVision ? 'yes' : 'no'}
                        </div>
                        <label className="ui-label">
                          <div className="ui-label-text">{t('settings.tabProvidersBaseUrl')}</div>
                          <input value={savedProvider.baseUrl} onChange={(event) => updateProviderField(provider.id, 'baseUrl', event.target.value)} />
                        </label>
                        <label className="ui-label">
                          <div className="ui-label-text">{t('settings.tabProvidersApiKeyEnv')}</div>
                          <input value={savedProvider.apiKeyEnv} onChange={(event) => updateProviderField(provider.id, 'apiKeyEnv', event.target.value)} />
                        </label>
                        <label className="ui-label">
                          <div className="ui-label-text">{t('settings.tabProvidersDefaultModel')}</div>
                          <input value={savedProvider.defaultModel} onChange={(event) => updateProviderField(provider.id, 'defaultModel', event.target.value)} />
                        </label>
                      </section>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {activeTab === 'tools' ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{t('settings.tabToolsTitle')}</h3>
                <p className="ui-card-description">{t('settings.tabToolsDescription')}</p>
                <div className="settings-provider-grid">
                  {toolPresets.map((preset) => {
                    const savedPreset = config.visualClient.toolsets.find((item) => item.id === preset.id)
                    if (!savedPreset) return null

                    return (
                      <section key={preset.id} className="ui-card-soft settings-provider-card">
                        <label className="chat-checkbox">
                          <input
                            type="checkbox"
                            checked={savedPreset.enabled}
                            onChange={(event) => toggleToolPreset(preset.id, event.target.checked)}
                          />
                          <span>{preset.label}</span>
                        </label>
                        <div className="ui-meta">{savedPreset.selectedTools.join(', ')}</div>
                      </section>
                    )
                  })}
                </div>
                <div className="settings-tool-grid">
                  {toolCatalog.map((tool) => (
                    <div key={tool.id} className="settings-tool-chip">
                      <div>{tool.label}</div>
                      <div className="ui-meta">{tool.category} · {tool.endpoint}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === 'mcp' ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{t('settings.tabMcpTitle')}</h3>
                {config.visualClient.mcpServers.map((server, index) => (
                  <section key={`${server.id}-${index}`} className="ui-card-soft settings-provider-card">
                    <label className="chat-checkbox">
                      <input
                        type="checkbox"
                        checked={server.enabled}
                        onChange={(event) => updateMcpServer(index, 'enabled', event.target.checked)}
                      />
                      <span>{server.id}</span>
                    </label>
                    <label className="ui-label">
                      <div className="ui-label-text">{t('settings.tabMcpTransport')}</div>
                      <select value={server.transport} onChange={(event) => updateMcpServer(index, 'transport', event.target.value)}>
                        <option value="stdio">stdio</option>
                        <option value="http">http</option>
                      </select>
                    </label>
                    <label className="ui-label">
                      <div className="ui-label-text">{t('settings.tabMcpCommand')}</div>
                      <input value={server.command} onChange={(event) => updateMcpServer(index, 'command', event.target.value)} />
                    </label>
                    <label className="ui-label">
                      <div className="ui-label-text">{t('settings.tabMcpUrl')}</div>
                      <input value={server.url} onChange={(event) => updateMcpServer(index, 'url', event.target.value)} />
                    </label>
                  </section>
                ))}
              </div>
            ) : null}

            {activeTab === 'terminal' ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{t('settings.tabTerminalTitle')}</h3>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabTerminalBackend')}</div>
                  <select
                    value={config.terminal.backend}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        terminal: { ...current.terminal, backend: event.target.value },
                      }))
                    }
                  >
                    {terminalBackendCatalog.map((backend) => (
                      <option key={backend.id} value={backend.id}>
                        {backend.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabTerminalTimeout')}</div>
                  <input
                    aria-label={t('settings.tabTerminalTimeout')}
                    value={String(config.terminal.timeout)}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        terminal: { ...current.terminal, timeout: Number(event.target.value || 0) },
                      }))
                    }
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabTerminalWorkingDir')}</div>
                  <input
                    value={config.terminal.cwd}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        terminal: { ...current.terminal, cwd: event.target.value },
                      }))
                    }
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabTerminalExecTarget')}</div>
                  <input
                    value={config.terminal.target}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        terminal: { ...current.terminal, target: event.target.value },
                      }))
                    }
                  />
                </label>
                <div className="settings-provider-grid">
                  {terminalBackendCatalog.map((backend) => (
                    <section key={backend.id} className="ui-card-soft settings-provider-card">
                      <div className="ui-card-title">{backend.label}</div>
                      <div className="ui-meta">{backend.runtime}</div>
                      <div className="ui-meta">{backend.description}</div>
                    </section>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === 'automation' ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{t('settings.tabAutomationTitle')}</h3>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabAutomationMaxTurns')}</div>
                  <input
                    aria-label={t('settings.tabAutomationMaxTurns')}
                    value={String(config.agent.max_turns)}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        agent: { ...current.agent, max_turns: Number(event.target.value || 0) },
                      }))
                    }
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabAutomationSessionName')}</div>
                  <input
                    value={config.visualClient.session.sessionName}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          session: { ...current.visualClient.session, sessionName: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label className="chat-checkbox">
                  <input
                    aria-label={t('settings.tabAutomationStreamingSSE')}
                    type="checkbox"
                    checked={config.visualClient.session.stream}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          session: { ...current.visualClient.session, stream: event.target.checked },
                        },
                      }))
                    }
                  />
                  <span>{t('settings.tabAutomationStreamingSSE')}</span>
                </label>
                <label className="chat-checkbox">
                  <input
                    type="checkbox"
                    checked={config.visualClient.session.memory}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          session: { ...current.visualClient.session, memory: event.target.checked },
                        },
                      }))
                    }
                  />
                  <span>{t('settings.tabAutomationSessionMemory')}</span>
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabAutomationCompression')}</div>
                  <select
                    value={config.visualClient.session.compression}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          session: {
                            ...current.visualClient.session,
                            compression: event.target.value as VisualClientConfig['visualClient']['session']['compression'],
                          },
                        },
                      }))
                    }
                  >
                    <option value="off">{t('settings.tabAutomationCompressionOff')}</option>
                    <option value="adaptive">{t('settings.tabAutomationCompressionAdaptive')}</option>
                    <option value="aggressive">{t('settings.tabAutomationCompressionAggressive')}</option>
                  </select>
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabAutomationMemoryFile')}</div>
                  <input
                    value={config.visualClient.memory.memoryFile}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          memory: { ...current.visualClient.memory, memoryFile: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabAutomationUserFile')}</div>
                  <input
                    value={config.visualClient.memory.userFile}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          memory: { ...current.visualClient.memory, userFile: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label className="chat-checkbox">
                  <input
                    type="checkbox"
                    checked={config.visualClient.cron.enabled}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          cron: { ...current.visualClient.cron, enabled: event.target.checked },
                        },
                      }))
                    }
                  />
                  <span>{t('settings.tabAutomationEnableCron')}</span>
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabAutomationCronConcurrency')}</div>
                  <input
                    value={String(config.visualClient.cron.concurrency)}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          cron: { ...current.visualClient.cron, concurrency: Number(event.target.value || 0) },
                        },
                      }))
                    }
                  />
                </label>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabAutomationTimezone')}</div>
                  <input
                    value={config.visualClient.cron.timezone}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          cron: { ...current.visualClient.cron, timezone: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
              </div>
            ) : null}

            {activeTab === 'packaging' ? (
              <div className="settings-stack">
                <h3 className="ui-card-title">{t('settings.tabPackagingTitle')}</h3>
                <label className="ui-label">
                  <div className="ui-label-text">{t('settings.tabPackagingInstallProfile')}</div>
                  <select
                    value={config.visualClient.packaging.installProfile}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          packaging: {
                            ...current.visualClient.packaging,
                            installProfile: event.target.value as VisualClientConfig['visualClient']['packaging']['installProfile'],
                          },
                        },
                      }))
                    }
                  >
                    <option value="desktop">{t('settings.tabPackagingDesktop')}</option>
                    <option value="docker">{t('settings.tabPackagingDocker')}</option>
                    <option value="hybrid">{t('settings.tabPackagingHybrid')}</option>
                  </select>
                </label>
                <label className="chat-checkbox">
                  <input
                    type="checkbox"
                    checked={config.visualClient.packaging.bundleDockerCompose}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          packaging: { ...current.visualClient.packaging, bundleDockerCompose: event.target.checked },
                        },
                      }))
                    }
                  />
                  <span>{t('settings.tabPackagingBundleDocker')}</span>
                </label>
                <label className="chat-checkbox">
                  <input
                    type="checkbox"
                    checked={config.visualClient.packaging.includeEnvDoctor}
                    onChange={(event) =>
                      updateConfig((current) => ({
                        ...current,
                        visualClient: {
                          ...current.visualClient,
                          packaging: { ...current.visualClient.packaging, includeEnvDoctor: event.target.checked },
                        },
                      }))
                    }
                  />
                  <span>{t('settings.tabPackagingIncludeEnvDoctor')}</span>
                </label>

                <div className="settings-provider-grid">
                  {envProbeCatalog.map((probe) => (
                    <section key={probe.id} className="ui-card-soft settings-provider-card">
                      <div className="ui-card-title">{probe.label}</div>
                      <div className="ui-code">{probe.command}</div>
                    </section>
                  ))}
                </div>
                <div className="settings-endpoint-list">
                  {apiEndpointCatalog.map((endpoint) => (
                    <div key={`${endpoint.method}-${endpoint.path}`} className="chat-endpoint-item">
                      <div className="ui-code">{endpoint.path}</div>
                      <div className="ui-meta">{endpoint.method} · {endpoint.summary}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="ui-card">
          <div className="ui-card-body">
            <h3 className="ui-card-title">{t('settings.sidebarPortableProfile')}</h3>
            <p className="ui-card-description">{t('settings.portabilityDescription')}</p>
            <div className="ui-toolbar" style={{ marginTop: 18 }}>
              <button onClick={save} disabled={loading || hasValidationErrors}>{t('settings.save')}</button>
              <button onClick={load} disabled={loading}>{t('settings.reload')}</button>
              <button onClick={exportConfig} disabled={loading}>{t('settings.export')}</button>
              <button onClick={() => importInputRef.current?.click()} disabled={loading}>{t('settings.import')}</button>
            </div>
            <div className="ui-meta" style={{ marginTop: 14 }}>
              {t('settings.importHint')}
            </div>
            {hasValidationErrors ? (
              <div className="ui-status-error" style={{ marginTop: 14 }}>
                {validationErrors.join('\n')}
              </div>
            ) : null}

            <div className="settings-summary-grid">
              <div className="settings-summary-card">
                <div className="ui-meta">{t('settings.sidebarEnabledProviders')}</div>
                <div className="settings-summary-value">{config.visualClient.providers.filter((provider) => provider.enabled).length}</div>
              </div>
              <div className="settings-summary-card">
                <div className="ui-meta">{t('settings.sidebarEnabledToolsets')}</div>
                <div className="settings-summary-value">{config.visualClient.toolsets.filter((toolset) => toolset.enabled).length}</div>
              </div>
              <div className="settings-summary-card">
                <div className="ui-meta">{t('settings.sidebarConfiguredMcp')}</div>
                <div className="settings-summary-value">{config.visualClient.mcpServers.filter((server) => server.enabled).length}</div>
              </div>
            </div>

            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={importConfig}
              style={{ display: 'none' }}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
