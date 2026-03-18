'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, XCircle, Wand2 } from 'lucide-react'

type Suggestion = {
  id: string
  entityType: 'DESTINATION' | 'PACKAGE' | 'BLOG' | 'COMMUNITY_POST'
  entityId: string
  field: string
  oldValue: string | null
  newValue: string
  note: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  appliedAt: string | null
  createdAt: string
  updatedAt: string
}

function fmtSrc(src: string | null | undefined) {
  const v = typeof src === 'string' ? src.trim() : ''
  return v.length > 0 ? v : '/images/travel_detsinations.jpg'
}

export default function ImageSuggestionsPage() {
  const { toast } = useToast()
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/image-suggestions?status=${status}`)
      if (!res.ok) throw new Error('Failed')
      const json = (await res.json()) as { suggestions: Suggestion[] }
      setSuggestions(json.suggestions || [])
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Failed to fetch suggestions', variant: 'destructive' })
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [status, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const doPatch = async (id: string, action: 'approve' | 'reject', apply: boolean) => {
    try {
      const res = await fetch(`/api/image-suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, apply }),
      })
      const json = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        toast({ title: 'Error', description: json?.error || 'Action failed', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: 'Updated' })
      fetchData()
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' })
    }
  }

  const header = useMemo(() => {
    return (
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold ml-12 lg:ml-0 tracking-tight">Image Suggestions</h2>
        <div className="flex items-center gap-2">
          <Button variant={status === 'PENDING' ? 'default' : 'outline'} onClick={() => setStatus('PENDING')}>
            Pending
          </Button>
          <Button variant={status === 'APPROVED' ? 'default' : 'outline'} onClick={() => setStatus('APPROVED')}>
            Approved
          </Button>
          <Button variant={status === 'REJECTED' ? 'default' : 'outline'} onClick={() => setStatus('REJECTED')}>
            Rejected
          </Button>
        </div>
      </div>
    )
  }, [status])

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {header}

      <Card>
        <CardHeader>
          <CardTitle>Review & Apply</CardTitle>
          <CardDescription>Approve a suggestion or apply it directly to update imageData.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-sm text-muted-foreground">No suggestions.</div>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className="rounded-3xl border bg-card p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{s.entityType}</Badge>
                      <Badge variant={s.status === 'PENDING' ? 'secondary' : 'default'} className="text-xs">{s.status}</Badge>
                      <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground break-all">{s.entityId}</div>
                    {s.note ? <div className="mt-2 text-sm">{s.note}</div> : null}
                  </div>

                  {s.status === 'PENDING' ? (
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => doPatch(s.id, 'approve', false)} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button onClick={() => doPatch(s.id, 'approve', true)} variant="secondary" className="gap-2">
                        <Wand2 className="h-4 w-4" /> Approve & Apply
                      </Button>
                      <Button onClick={() => doPatch(s.id, 'reject', false)} variant="outline" className="gap-2">
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border bg-muted/10 p-3">
                    <div className="text-xs font-semibold">Current</div>
                    <div className="mt-2 relative h-[180px] w-full overflow-hidden rounded-xl border bg-muted/20">
                      <Image src={fmtSrc(s.oldValue)} alt="Current" fill className="object-cover" sizes="520px" />
                    </div>
                    <div className="mt-2 break-all text-[11px] text-muted-foreground">{s.oldValue || '(empty)'}</div>
                  </div>
                  <div className="rounded-2xl border bg-muted/10 p-3">
                    <div className="text-xs font-semibold">Proposed</div>
                    <div className="mt-2 relative h-[180px] w-full overflow-hidden rounded-xl border bg-muted/20">
                      <Image src={fmtSrc(s.newValue)} alt="Proposed" fill className="object-cover" sizes="520px" />
                    </div>
                    <div className="mt-2 break-all text-[11px] text-muted-foreground">{s.newValue}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

