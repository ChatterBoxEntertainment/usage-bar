import assert from 'node:assert/strict'
import test from 'node:test'
import { meterValue, untilReset } from '../hooks/format.ts'
import { register } from '../hooks/register.ts'

function host(reading) {
  const handlers = new Map()
  let time = 0
  let invalidations = 0
  let timer = null
  register((name, matcher, handler) => {
    if (typeof matcher === 'function') handler = matcher
    handlers.set(name, handler)
  })
  const element = type => props => ({ type, ...props })
  const api = {
    clock: {
      now: async () => time,
      every(ms, callback) { timer = { ms, callback } },
    },
    ui: {
      invalidate: () => { invalidations += 1 },
      resolve: () => ({ Box: element('Box'), Text: element('Text') }),
    },
    session: { usage: async () => reading },
  }
  return {
    api,
    handlers,
    setTime(ms) { time = ms },
    get invalidations() { return invalidations },
    get timer() { return timer },
  }
}

function allText(tree) {
  return [
    ...(tree.children ?? []).flatMap(child => typeof child === 'string' ? [child] : child ? allText(child) : []),
  ].join('')
}

test('meters clamp cells, keep measured percentages, and reject invalid readings', () => {
  assert.deepEqual(meterValue(undefined), { filled: 0, percent: 'n/a', color: undefined })
  assert.equal(meterValue(Number.NaN).filled, 0)
  assert.deepEqual(meterValue(71), { filled: 7, percent: '71%', color: 'warning' })
  assert.deepEqual(meterValue(120), { filled: 10, percent: '120%', color: 'error' })
  assert.equal(meterValue(-3).percent, '0%')
  assert.equal(untilReset('garbage', 0), null)
  assert.equal(untilReset('1970-01-01T02:05:00.000Z', 0), '2h05m')
  assert.equal(untilReset('1970-01-04T04:00:00.000Z', 0), '3d4h')
})

test('the band shows usage, preserves other mods, and refreshes on measurement', async () => {
  const h = host({
    context: {},
    rateLimits: [
      { kind: 'five_hour', percentUsed: 71, resetsAt: '1970-01-01T02:05:00.000Z' },
      { kind: 'seven_day', percentUsed: 92 },
    ],
    cost: { usd: 0 },
  })
  await h.handlers.get('session.start')(h.api, {}, async () => ({}))
  assert.equal(h.timer.ms, 30_000)
  h.timer.callback()
  await h.handlers.get('session.measure')(h.api, {}, async () => ({}))
  assert.equal(h.invalidations, 2)

  const other = { type: 'Text', children: ['other mod'] }
  const band = await h.handlers.get('ui.render')(h.api, {}, async () => other)
  assert.equal(band.children[1], other)
  assert.match(allText(band), /ctx ░{10} n\/a/)
  assert.match(allText(band), /5h █{7}░{3} 71% · 2h05m/)
  assert.match(allText(band), /7d █{9}░ 92%/)
  assert.match(allText(band), /\$0\.00/)
  assert.doesNotMatch(allText(band), /spend/)
})

test('tok/s counts model-request time and excludes a gap between requests', async () => {
  const h = host({ context: { percent: 35 }, rateLimits: [] })
  await h.handlers.get('turn.start')(h.api, {}, async () => ({}))

  for (const [start, stop, output] of [[100, 1100, 100], [10_000, 11_000, 200]]) {
    h.setTime(start)
    const step = h.handlers.get('turn.step')(h.api, {}, async function* () {
      h.setTime(stop)
      return { usage: { output_tokens: output } }
    })
    const result = await step.next()
    assert.equal(result.value.usage.output_tokens, output)
  }

  await h.handlers.get('turn.complete')(h.api, {}, async () => ({}))
  const band = await h.handlers.get('ui.render')(h.api, {}, async () => null)
  assert.match(allText(band), /150 tok\/s/)

  await h.handlers.get('turn.start')(h.api, { agentId: 'subagent' }, async () => ({}))
  const afterSubagent = await h.handlers.get('ui.render')(h.api, {}, async () => null)
  assert.match(allText(afterSubagent), /150 tok\/s/)
})
