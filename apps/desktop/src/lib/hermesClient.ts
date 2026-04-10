export type HermesStatus = {
  runtime: {
    hermesHomeDir: string
    hermesInstallDir: string
    gatewayPort: number
  }
  gateway: unknown
  updater: unknown
}

export async function hermesStatus(): Promise<HermesStatus> {
  return (await window.hermes.status()) as HermesStatus
}

export async function hermesApiChat(params: {
  model?: string
  stream?: boolean
  messages: Array<{ role: string; content: string }>
  metadata?: Record<string, unknown>
}): Promise<string> {
  const body = JSON.stringify({
    model: params.model ?? 'hermes-agent',
    stream: params.stream ?? false,
    messages: params.messages,
    metadata: params.metadata ?? {},
  })
  const res = await window.hermes.api.fetch({
    path: '/v1/chat/completions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`API error ${res.status}: ${res.body}`)
  }
  const parsed = JSON.parse(res.body) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return parsed.choices?.[0]?.message?.content ?? ''
}
