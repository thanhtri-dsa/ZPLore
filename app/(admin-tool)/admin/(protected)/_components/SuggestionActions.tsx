'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

export function SuggestionActions({ id, apiBasePath = '/api/admin/image-suggestions' }: { id: string; apiBasePath?: string }) {
  const [loading, setLoading] = React.useState<'approve' | 'apply' | 'reject' | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)

  const patch = async (action: 'approve' | 'reject', apply: boolean) => {
    setMsg(null)
    setLoading(action === 'approve' ? (apply ? 'apply' : 'approve') : 'reject')
    try {
      const res = await fetch(`${apiBasePath}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, apply }),
      })
      const json = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        setMsg(json?.error || 'Thao tác thất bại')
        return
      }
      setMsg('OK')
      window.location.reload()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() => patch('approve', false)}
        disabled={!!loading}
        className="rounded-2xl bg-white text-black hover:bg-white/90"
      >
        {loading === 'approve' ? 'Đang duyệt...' : 'Duyệt'}
      </Button>
      <Button
        onClick={() => patch('approve', true)}
        disabled={!!loading}
        className="rounded-2xl bg-emerald-400 text-black hover:bg-emerald-300"
      >
        {loading === 'apply' ? 'Đang áp dụng...' : 'Duyệt & áp dụng'}
      </Button>
      <Button
        onClick={() => patch('reject', false)}
        disabled={!!loading}
        variant="outline"
        className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
      >
        {loading === 'reject' ? 'Đang từ chối...' : 'Từ chối'}
      </Button>
      {msg && <div className="text-xs text-white/70">{msg}</div>}
    </div>
  )
}
