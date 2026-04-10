export type ProviderDefinition = {
  id: string
  label: string
  baseUrl: string
  envKey: string
  supportsStreaming: boolean
  supportsVision: boolean
}

export type ToolDefinition = {
  id: string
  label: string
  category: 'core' | 'filesystem' | 'browser' | 'automation' | 'media' | 'integration'
  endpoint: string
}

export type McpTransportDefinition = {
  id: string
  label: string
  mode: 'stdio' | 'http'
  defaultCommand?: string
  defaultUrl?: string
}

export type TerminalBackendDefinition = {
  id: string
  label: string
  runtime: string
  description: string
}

export type ApiEndpointDefinition = {
  path: string
  method: 'GET' | 'POST'
  summary: string
}

export type EnvProbeDefinition = {
  id: string
  label: string
  command: string
}

export type ToolPreset = {
  id: string
  label: string
  toolIds: string[]
}

export type VisualClientConfig = {
  model: string
  agent: {
    max_turns: number
    subagents_enabled: boolean
    planning_mode: 'fast' | 'balanced' | 'deep'
  }
  terminal: {
    backend: string
    timeout: number
    cwd: string
    target: string
  }
  visualClient: {
    connection: {
      baseUrl: string
      apiKey: string
      gatewayPort: number
      healthPath: string
    }
    providers: Array<{
      id: string
      enabled: boolean
      baseUrl: string
      apiKeyEnv: string
      defaultModel: string
    }>
    toolsets: Array<{
      id: string
      enabled: boolean
      selectedTools: string[]
    }>
    mcpServers: Array<{
      id: string
      enabled: boolean
      transport: 'stdio' | 'http'
      command: string
      url: string
    }>
    session: {
      stream: boolean
      memory: boolean
      compression: 'off' | 'adaptive' | 'aggressive'
      sessionName: string
    }
    memory: {
      memoryFile: string
      userFile: string
      enableCrossSessionSearch: boolean
      retentionPolicy: string
    }
    cron: {
      enabled: boolean
      concurrency: number
      timezone: string
      defaultChannel: string
    }
    packaging: {
      installProfile: 'desktop' | 'docker' | 'hybrid'
      bundleDockerCompose: boolean
      includeEnvDoctor: boolean
    }
  }
}

export const providerCatalog: ProviderDefinition[] = [
  { id: 'openrouter', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', envKey: 'OPENROUTER_API_KEY', supportsStreaming: true, supportsVision: true },
  { id: 'anthropic', label: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', envKey: 'ANTHROPIC_API_KEY', supportsStreaming: true, supportsVision: true },
  { id: 'nous', label: 'Nous', baseUrl: 'https://api.nousresearch.com/v1', envKey: 'NOUS_API_KEY', supportsStreaming: true, supportsVision: true },
  { id: 'openai', label: 'OpenAI Compatible', baseUrl: 'http://127.0.0.1:3000/v1', envKey: 'OPENAI_API_KEY', supportsStreaming: true, supportsVision: true },
  { id: 'minimax', label: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1', envKey: 'MINIMAX_API_KEY', supportsStreaming: true, supportsVision: false },
  { id: 'ollama', label: 'Ollama', baseUrl: 'http://127.0.0.1:11434/v1', envKey: 'OLLAMA_API_KEY', supportsStreaming: true, supportsVision: true },
  { id: 'groq', label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', envKey: 'GROQ_API_KEY', supportsStreaming: true, supportsVision: false },
  { id: 'together', label: 'Together', baseUrl: 'https://api.together.xyz/v1', envKey: 'TOGETHER_API_KEY', supportsStreaming: true, supportsVision: true },
  { id: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', envKey: 'DEEPSEEK_API_KEY', supportsStreaming: true, supportsVision: false },
  { id: 'qwen', label: 'Qwen / DashScope', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', envKey: 'DASHSCOPE_API_KEY', supportsStreaming: true, supportsVision: true },
  { id: 'bedrock', label: 'AWS Bedrock', baseUrl: 'https://bedrock-runtime.us-east-1.amazonaws.com', envKey: 'AWS_ACCESS_KEY_ID', supportsStreaming: true, supportsVision: true },
  { id: 'vertex', label: 'Google Vertex AI', baseUrl: 'https://us-central1-aiplatform.googleapis.com/v1', envKey: 'GOOGLE_APPLICATION_CREDENTIALS', supportsStreaming: true, supportsVision: true },
]

export const toolCatalog: ToolDefinition[] = [
  { id: 'web', label: 'Web Search', category: 'core', endpoint: '/v1/toolsets' },
  { id: 'reasoning', label: 'Reasoning', category: 'core', endpoint: '/v1/toolsets' },
  { id: 'terminal', label: 'Terminal', category: 'core', endpoint: '/v1/toolsets' },
  { id: 'file-read', label: 'File Read', category: 'filesystem', endpoint: '/v1/toolsets' },
  { id: 'file-write', label: 'File Write', category: 'filesystem', endpoint: '/v1/toolsets' },
  { id: 'glob', label: 'Glob Search', category: 'filesystem', endpoint: '/v1/toolsets' },
  { id: 'grep', label: 'Ripgrep Search', category: 'filesystem', endpoint: '/v1/toolsets' },
  { id: 'patch', label: 'Apply Patch', category: 'filesystem', endpoint: '/v1/toolsets' },
  { id: 'browser-open', label: 'Browser Open', category: 'browser', endpoint: '/v1/toolsets' },
  { id: 'browser-click', label: 'Browser Click', category: 'browser', endpoint: '/v1/toolsets' },
  { id: 'browser-type', label: 'Browser Type', category: 'browser', endpoint: '/v1/toolsets' },
  { id: 'browser-screenshot', label: 'Browser Screenshot', category: 'browser', endpoint: '/v1/toolsets' },
  { id: 'browser-pdf', label: 'Browser PDF Snapshot', category: 'browser', endpoint: '/v1/toolsets' },
  { id: 'vision', label: 'Vision', category: 'media', endpoint: '/v1/toolsets' },
  { id: 'image-gen', label: 'Image Generation', category: 'media', endpoint: '/v1/toolsets' },
  { id: 'speech-in', label: 'Speech To Text', category: 'media', endpoint: '/v1/toolsets' },
  { id: 'speech-out', label: 'Text To Speech', category: 'media', endpoint: '/v1/toolsets' },
  { id: 'video', label: 'Video Tools', category: 'media', endpoint: '/v1/toolsets' },
  { id: 'cron', label: 'Cron Jobs', category: 'automation', endpoint: '/v1/cronjobs' },
  { id: 'scheduler', label: 'Scheduler', category: 'automation', endpoint: '/v1/cronjobs' },
  { id: 'session', label: 'Session Manager', category: 'automation', endpoint: '/v1/session' },
  { id: 'memory', label: 'Memory Store', category: 'automation', endpoint: '/v1/memory' },
  { id: 'compression', label: 'Trajectory Compression', category: 'automation', endpoint: '/v1/memory' },
  { id: 'subagent', label: 'Sub-Agent Runner', category: 'automation', endpoint: '/v1/agents' },
  { id: 'eval', label: 'Evaluation Harness', category: 'automation', endpoint: '/v1/evals' },
  { id: 'notion', label: 'Notion', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'github', label: 'GitHub', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'slack', label: 'Slack', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'discord', label: 'Discord', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'telegram', label: 'Telegram', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'whatsapp', label: 'WhatsApp', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'feishu', label: 'Feishu', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'wecom', label: 'WeCom', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'email', label: 'Email', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'calendar', label: 'Calendar', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'docker', label: 'Docker', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'ssh', label: 'SSH', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'modal', label: 'Modal', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'daytona', label: 'Daytona', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'singularity', label: 'Singularity', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'mcp', label: 'MCP', category: 'integration', endpoint: '/v1/toolsets' },
  { id: 'vector-store', label: 'Vector Store', category: 'integration', endpoint: '/v1/memory' },
]

export const toolPresets: ToolPreset[] = [
  { id: 'chat-core', label: 'Chat Core', toolIds: ['web', 'reasoning', 'terminal', 'memory', 'compression'] },
  { id: 'dev-ops', label: 'DevOps', toolIds: ['terminal', 'file-read', 'file-write', 'grep', 'docker', 'ssh', 'cron'] },
  { id: 'automation', label: 'Automation', toolIds: ['cron', 'scheduler', 'session', 'subagent', 'notion', 'github', 'slack'] },
  { id: 'multimodal', label: 'Multimodal', toolIds: ['vision', 'image-gen', 'speech-in', 'speech-out', 'video'] },
]

export const mcpTransportCatalog: McpTransportDefinition[] = [
  { id: 'stdio-python', label: 'Python stdio', mode: 'stdio', defaultCommand: 'uv run mcp_server.py' },
  { id: 'stdio-node', label: 'Node stdio', mode: 'stdio', defaultCommand: 'pnpm mcp:start' },
  { id: 'http-local', label: 'Local HTTP', mode: 'http', defaultUrl: 'http://127.0.0.1:8787/mcp' },
  { id: 'http-remote', label: 'Remote HTTP', mode: 'http', defaultUrl: 'https://your-mcp.example.com' },
]

export const terminalBackendCatalog: TerminalBackendDefinition[] = [
  { id: 'local', label: 'Local', runtime: 'Native shell', description: 'Run Hermes in the same machine as the desktop client.' },
  { id: 'ssh', label: 'SSH', runtime: 'Remote Linux / macOS', description: 'Connect to a remote host for tool execution.' },
  { id: 'docker', label: 'Docker', runtime: 'Container', description: 'Use a reproducible container image for local or remote tasks.' },
  { id: 'singularity', label: 'Singularity', runtime: 'HPC container', description: 'Target research and cluster environments.' },
  { id: 'modal', label: 'Modal', runtime: 'Serverless', description: 'Burst into a hosted execution environment.' },
  { id: 'daytona', label: 'Daytona', runtime: 'Cloud workspace', description: 'Attach to a provisioned remote development workspace.' },
]

export const apiEndpointCatalog: ApiEndpointDefinition[] = [
  { path: '/health', method: 'GET', summary: 'Desktop health and gateway readiness probe.' },
  { path: '/v1/models', method: 'GET', summary: 'Fetch available models and provider capabilities.' },
  { path: '/v1/chat/completions', method: 'POST', summary: 'OpenAI-compatible chat endpoint with optional SSE streaming.' },
  { path: '/v1/toolsets', method: 'GET', summary: 'List available toolsets and enabled tools.' },
  { path: '/v1/skills', method: 'GET', summary: 'List local and remote skills.' },
  { path: '/v1/memory', method: 'GET', summary: 'Search session memory, USER.md, and MEMORY.md.' },
  { path: '/v1/cronjobs', method: 'GET', summary: 'Inspect cron jobs and execution state.' },
  { path: '/v1/cronjobs', method: 'POST', summary: 'Create or update cron jobs from the UI.' },
]

export const envProbeCatalog: EnvProbeDefinition[] = [
  { id: 'hermes-cli', label: 'Hermes CLI', command: 'hermes --version' },
  { id: 'python', label: 'Python', command: 'python3 --version' },
  { id: 'uv', label: 'uv', command: 'uv --version' },
  { id: 'docker', label: 'Docker', command: 'docker --version' },
  { id: 'ollama', label: 'Ollama', command: 'ollama --version' },
  { id: 'git', label: 'Git', command: 'git --version' },
]

export const onboardingSteps = [
  'Detect local Hermes, Python, uv, Docker, and Ollama availability.',
  'Choose a provider and test the OpenAI-compatible base URL.',
  'Enable the tool presets you want Hermes Agent to expose.',
  'Connect MCP servers over stdio or HTTP for extended capabilities.',
  'Pick a terminal backend and save a desktop install profile.',
]

export function countConfiguredFields(config: VisualClientConfig): number {
  return [
    config.model,
    String(config.agent.max_turns),
    config.terminal.backend,
    String(config.terminal.timeout),
    config.terminal.cwd,
    config.visualClient.connection.baseUrl,
    config.visualClient.connection.apiKey,
    String(config.visualClient.connection.gatewayPort),
    config.visualClient.session.sessionName,
    config.visualClient.memory.memoryFile,
    config.visualClient.memory.userFile,
  ].filter((value) => value.trim().length > 0).length
}

export function createDefaultVisualClientConfig(): VisualClientConfig {
  return {
    model: 'nous/hermes-agent',
    agent: {
      max_turns: 90,
      subagents_enabled: true,
      planning_mode: 'balanced',
    },
    terminal: {
      backend: 'local',
      timeout: 180,
      cwd: '.',
      target: 'workspace',
    },
    visualClient: {
      connection: {
        baseUrl: 'http://127.0.0.1:3000/v1',
        apiKey: '',
        gatewayPort: 3000,
        healthPath: '/health',
      },
      providers: providerCatalog.map((provider, index) => ({
        id: provider.id,
        enabled: index < 4,
        baseUrl: provider.baseUrl,
        apiKeyEnv: provider.envKey,
        defaultModel:
          provider.id === 'openrouter'
            ? 'nousresearch/hermes-3-llama-3.1-70b'
            : provider.id === 'anthropic'
              ? 'claude-sonnet-4-20250514'
              : provider.id === 'ollama'
                ? 'qwen2.5-coder:latest'
                : 'hermes-agent',
      })),
      toolsets: toolPresets.map((preset) => ({
        id: preset.id,
        enabled: preset.id !== 'multimodal',
        selectedTools: [...preset.toolIds],
      })),
      mcpServers: mcpTransportCatalog.map((server) => ({
        id: server.id,
        enabled: server.id === 'stdio-python',
        transport: server.mode,
        command: server.defaultCommand ?? '',
        url: server.defaultUrl ?? '',
      })),
      session: {
        stream: true,
        memory: true,
        compression: 'adaptive',
        sessionName: 'Default workspace session',
      },
      memory: {
        memoryFile: 'MEMORY.md',
        userFile: 'USER.md',
        enableCrossSessionSearch: true,
        retentionPolicy: 'retain_last_30_sessions',
      },
      cron: {
        enabled: true,
        concurrency: 2,
        timezone: 'Asia/Shanghai',
        defaultChannel: 'desktop',
      },
      packaging: {
        installProfile: 'desktop',
        bundleDockerCompose: true,
        includeEnvDoctor: true,
      },
    },
  }
}

export function normalizeVisualClientConfig(raw: Record<string, unknown> | null | undefined): VisualClientConfig {
  const defaults = createDefaultVisualClientConfig()
  const root = raw ?? {}
  const visualClient = (root.visualClient ?? {}) as Record<string, unknown>
  const connection = (visualClient.connection ?? {}) as Record<string, unknown>
  const session = (visualClient.session ?? {}) as Record<string, unknown>
  const memory = (visualClient.memory ?? {}) as Record<string, unknown>
  const cron = (visualClient.cron ?? {}) as Record<string, unknown>
  const packaging = (visualClient.packaging ?? {}) as Record<string, unknown>
  const agent = (root.agent ?? {}) as Record<string, unknown>
  const terminal = (root.terminal ?? {}) as Record<string, unknown>
  const providerMap = new Map(
    (((visualClient.providers as Array<Record<string, unknown>> | undefined) ?? []).map((provider) => [String(provider.id ?? ''), provider])),
  )
  const toolsetMap = new Map(
    (((visualClient.toolsets as Array<Record<string, unknown>> | undefined) ?? []).map((toolset) => [String(toolset.id ?? ''), toolset])),
  )
  const mcpMap = new Map(
    (((visualClient.mcpServers as Array<Record<string, unknown>> | undefined) ?? []).map((server) => [String(server.id ?? ''), server])),
  )

  return {
    model: String(root.model ?? defaults.model),
    agent: {
      max_turns: Number(agent.max_turns ?? defaults.agent.max_turns),
      subagents_enabled: Boolean(agent.subagents_enabled ?? defaults.agent.subagents_enabled),
      planning_mode: (agent.planning_mode as VisualClientConfig['agent']['planning_mode']) ?? defaults.agent.planning_mode,
    },
    terminal: {
      backend: String(terminal.backend ?? defaults.terminal.backend),
      timeout: Number(terminal.timeout ?? defaults.terminal.timeout),
      cwd: String(terminal.cwd ?? defaults.terminal.cwd),
      target: String(terminal.target ?? defaults.terminal.target),
    },
    visualClient: {
      connection: {
        baseUrl: String(connection.baseUrl ?? defaults.visualClient.connection.baseUrl),
        apiKey: String(connection.apiKey ?? defaults.visualClient.connection.apiKey),
        gatewayPort: Number(connection.gatewayPort ?? defaults.visualClient.connection.gatewayPort),
        healthPath: String(connection.healthPath ?? defaults.visualClient.connection.healthPath),
      },
      providers: defaults.visualClient.providers.map((provider) => {
        const existing = providerMap.get(provider.id) ?? {}
        return {
          id: provider.id,
          enabled: Boolean(existing.enabled ?? provider.enabled),
          baseUrl: String(existing.baseUrl ?? provider.baseUrl),
          apiKeyEnv: String(existing.apiKeyEnv ?? provider.apiKeyEnv),
          defaultModel: String(existing.defaultModel ?? provider.defaultModel),
        }
      }),
      toolsets: defaults.visualClient.toolsets.map((toolset) => {
        const existing = toolsetMap.get(toolset.id) ?? {}
        const selectedTools = Array.isArray(existing.selectedTools)
          ? existing.selectedTools.map((toolId) => String(toolId))
          : toolset.selectedTools
        return {
          id: toolset.id,
          enabled: Boolean(existing.enabled ?? toolset.enabled),
          selectedTools,
        }
      }),
      mcpServers: defaults.visualClient.mcpServers.map((server) => {
        const existing = mcpMap.get(server.id) ?? {}
        return {
          id: server.id,
          enabled: Boolean(existing.enabled ?? server.enabled),
          transport: (existing.transport as 'stdio' | 'http') ?? server.transport,
          command: String(existing.command ?? server.command),
          url: String(existing.url ?? server.url),
        }
      }),
      session: {
        stream: Boolean(session.stream ?? defaults.visualClient.session.stream),
        memory: Boolean(session.memory ?? defaults.visualClient.session.memory),
        compression: (session.compression as VisualClientConfig['visualClient']['session']['compression']) ?? defaults.visualClient.session.compression,
        sessionName: String(session.sessionName ?? defaults.visualClient.session.sessionName),
      },
      memory: {
        memoryFile: String(memory.memoryFile ?? defaults.visualClient.memory.memoryFile),
        userFile: String(memory.userFile ?? defaults.visualClient.memory.userFile),
        enableCrossSessionSearch: Boolean(memory.enableCrossSessionSearch ?? defaults.visualClient.memory.enableCrossSessionSearch),
        retentionPolicy: String(memory.retentionPolicy ?? defaults.visualClient.memory.retentionPolicy),
      },
      cron: {
        enabled: Boolean(cron.enabled ?? defaults.visualClient.cron.enabled),
        concurrency: Number(cron.concurrency ?? defaults.visualClient.cron.concurrency),
        timezone: String(cron.timezone ?? defaults.visualClient.cron.timezone),
        defaultChannel: String(cron.defaultChannel ?? defaults.visualClient.cron.defaultChannel),
      },
      packaging: {
        installProfile: (packaging.installProfile as VisualClientConfig['visualClient']['packaging']['installProfile']) ?? defaults.visualClient.packaging.installProfile,
        bundleDockerCompose: Boolean(packaging.bundleDockerCompose ?? defaults.visualClient.packaging.bundleDockerCompose),
        includeEnvDoctor: Boolean(packaging.includeEnvDoctor ?? defaults.visualClient.packaging.includeEnvDoctor),
      },
    },
  }
}
