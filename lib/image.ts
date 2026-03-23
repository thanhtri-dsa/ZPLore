export function isSafeImageSrc(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const src = value.trim()
  if (!src) return false
  if (src.startsWith('/')) return true
  if (/^https?:\/\//i.test(src)) return true
  if (/^data:image\//i.test(src)) return true
  return false
}

export function safeImageSrc(value: unknown, fallback: string): string {
  return isSafeImageSrc(value) ? value.trim() : fallback
}

