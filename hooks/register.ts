import type { Register } from 'claude-code'
import { meterValue, untilReset } from './format.ts'

const CELLS = 10
const LIMITS = [
  ['five_hour', '5h'],
  ['seven_day', '7d'],
  ['spend_limit', 'spend'],
] as const

export const register: Register = on => {
  let speed: number | null = null
  let tokens = 0
  let requestMs = 0

  on('session.start', ($, e, next) => {
    $.clock.every(30_000, () => $.ui.invalidate('ui.render'))
    return next(e)
  })

  on('session.measure', ($, e, next) => {
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('turn.start', ($, e, next) => {
    if (e.agentId === undefined) {
      tokens = 0
      requestMs = 0
      speed = null
      $.ui.invalidate('ui.render')
    }
    return next(e)
  })

  // Count only the main conversation's model requests. Tool time between
  // requests is excluded; request latency and streaming time are included.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId !== undefined) return yield* next(e)

    const started = await $.clock.now()
    const result = yield* next(e)
    const elapsed = (await $.clock.now()) - started
    const output = result.usage?.output_tokens
    if (typeof output === 'number' && Number.isFinite(output) && output > 0 && elapsed > 0) {
      tokens += output
      requestMs += elapsed
    }
    return result
  })

  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined) {
      speed = tokens > 0 && requestMs > 0 ? tokens / (requestMs / 1000) : null
      $.ui.invalidate('ui.render')
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // The band is shared. Keep the content rendered by other mods.
    const otherContent = await next(e)
    const { Box, Text } = $.ui.resolve(e)
    const usage = await $.session.usage()
    const now = await $.clock.now()

    const meter = (label: string, value: number | undefined, reset?: string | null) => {
      const { filled, percent, color } = meterValue(value)
      return Box({
        key: `usage-${label}`,
        flexDirection: 'row',
        children: [
          Text({ dimColor: true, children: [`${label} `] }),
          Text({ color, children: ['█'.repeat(filled)] }),
          Text({ dimColor: true, children: ['░'.repeat(CELLS - filled)] }),
          Text({ dimColor: true, children: [` ${percent}${reset ? ` · ${reset}` : ''}`] }),
        ],
      })
    }

    const items = [meter('ctx', usage.context.percent)]
    for (const [kind, label] of LIMITS) {
      const window = usage.rateLimits.find(limit => limit.kind === kind)
      if (window) items.push(meter(label, window.percentUsed, untilReset(window.resetsAt, now)))
    }
    if (usage.cost && Number.isFinite(usage.cost.usd)) {
      items.push(Text({ dimColor: true, children: [`$${usage.cost.usd.toFixed(2)}`] }))
    }
    if (speed !== null && Number.isFinite(speed)) {
      items.push(Text({ dimColor: true, children: [`${speed.toFixed(0)} tok/s`] }))
    }

    return Box({
      flexDirection: 'column',
      children: [
        Box({ flexDirection: 'row', flexWrap: 'wrap', columnGap: 2, children: items }),
        otherContent,
      ],
    })
  })
}
