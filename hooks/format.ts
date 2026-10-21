const CELLS = 10

export function meterValue(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { filled: 0, percent: 'n/a', color: undefined }
  }

  const used = Math.max(0, value)
  return {
    filled: Math.round(Math.min(100, used) / CELLS),
    percent: `${Number(used.toFixed(1))}%`,
    color: used >= 90 ? 'error' : used >= 70 ? 'warning' : 'success',
  }
}

export function untilReset(iso: string | undefined, now: number): string | null {
  if (!iso) return null
  const deadline = Date.parse(iso)
  if (!Number.isFinite(deadline) || !Number.isFinite(now)) return null

  const minutes = Math.max(0, Math.ceil((deadline - now) / 60_000))
  const hours = Math.floor(minutes / 60)
  if (hours >= 24) return `${Math.floor(hours / 24)}d${hours % 24}h`
  return hours > 0
    ? `${hours}h${String(minutes % 60).padStart(2, '0')}m`
    : `${minutes}m`
}
