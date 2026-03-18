'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function ImageSuggestionForm({
  entityType,
  entityId,
  oldValue,
  placeholder,
  apiPath = '/api/admin/image-suggestions',
}: {
  entityType: 'DESTINATION' | 'PACKAGE' | 'BLOG' | 'COMMUNITY_POST'
  entityId: string
  oldValue: string | null
  placeholder?: string
  apiPath?: string
}) {
  const [newValue, setNewValue] = React.useState('')
  const [note, setNote] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState<string | null>(null)

  const submit = async () => {
    setMsg(null)
    const v = newValue.trim()
    if (!v) return
    setLoading(true)
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          field: 'imageData',
          oldValue: oldValue || null,
          newValue: v,
          note: note.trim() || null,
        }),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null
        setMsg(json?.error || 'Tạo đề xuất thất bại')
        return
      }
      setNewValue('')
      setNote('')
      setMsg('Đã tạo đề xuất')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Input
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        placeholder={placeholder || 'Dán link ảnh mới (https://...) hoặc base64...'}
        className="rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/40"
      />
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú (tuỳ chọn)"
        className="min-h-[72px] rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/40"
      />
      <div className="flex items-center justify-between gap-3">
        <Button disabled={loading || newValue.trim().length === 0} onClick={submit} className="rounded-xl bg-white text-black hover:bg-white/90">
          {loading ? 'Đang gửi...' : 'Tạo đề xuất'}
        </Button>
        {msg && <div className="text-xs text-white/70">{msg}</div>}
      </div>
    </div>
  )
}
