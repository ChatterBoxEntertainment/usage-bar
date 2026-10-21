import type { Register } from 'claude-code'

const CELLS = 10
const LABEL: Record<string, string> = { five_hour: '5h', seven_day: '7d', spend_limit: 'spend' }

// Time left until a window resets, e.g. "3d4h", "2h05m" or "37m"; null when unknown.
const untilReset = (iso: string | undefined, now: number) => {
  if (!iso) return null
  const mins = Math.max(0, Math.floor((Date.parse(iso) - now) / 60_000))
  const h = Math.floor(mins / 60)
  if (h >= 24) return `${Math.floor(h / 24)}d${h % 24}h`
  return h > 0 ? `${h}h${String(mins % 60).padStart(2, '0')}m` : `${mins}m`
}

// Green under 70%, amber up to 90%, red past it.
const tone = (n: number) => (n >= 90 ? 'error' : n >= 70 ? 'warning' : 'success')

export const register: Register = on => {
  // Output tokens per second of the last main-loop answer, over its model requests only.
  let speed: number | null = null
  let tokens = 0
  let genMs = 0

  on('session.start', ($, e, next) => {
    $.clock.every(30_000, () => $.ui.invalidate('ui.render'))
    return next(e)
  })

  on('turn.start', ($, e, next) => {
    if (!e.agentId) tokens = genMs = 0
    return next(e)
  })

  // Times each main-loop request from send to stop. Tool runs fall between requests, so they are left out.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId) return yield* next(e)
    const started = await $.clock.now()
    const r = yield* next(e)
    if (r.usage) {
      tokens += r.usage.output_tokens
      genMs += (await $.clock.now()) - started
    }
    return r
  })

  on('turn.complete', ($, e, next) => {
    if (!e.agentId && genMs > 0) {
      speed = tokens / (genMs / 1000)
      $.ui.invalidate('ui.render')
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    const u = await $.session.usage()
    const now = await $.clock.now()

    // Filled cells take the level's colour; the rest stay dim. No reading draws all dim.
    const meter = (label: string, n: number | undefined, note?: string | null) => {
      const filled = n == null ? 0 : Math.min(CELLS, Math.round((n / 100) * CELLS))
      return (
        <Box key={label} flexDirection="row" gap={1}>
          <Text dimColor>{label}</Text>
          <Text color={n == null ? undefined : tone(n)}>{'█'.repeat(filled)}</Text>
          <Text dimColor>{'░'.repeat(CELLS - filled)}</Text>
          {note ? <Text dimColor>{note}</Text> : null}
        </Box>
      )
    }

    return (
      <Box flexDirection="row" gap={3}>
        {meter('ctx', u.context.percent)}
        {u.rateLimits.map(r =>
          meter(
            LABEL[r.kind] ?? r.kind,
            r.percentUsed,
            r.kind === 'spend_limit'
              ? `${Math.round(r.percentUsed)}%`
              : untilReset(r.resetsAt, now),
          ),
        )}
        {u.cost ? <Text dimColor>{`$${u.cost.usd.toFixed(2)}`}</Text> : null}
        {speed != null ? <Text dimColor>{`${speed.toFixed(0)} tok/s`}</Text> : null}
      </Box>
    )
  })
}
