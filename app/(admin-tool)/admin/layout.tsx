import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const password = process.env.ADMIN_TOOL_PASSWORD?.trim()
  if (!password) {
    return (
      <div className="min-h-screen bg-[#0b1220] text-white">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-white">Admin Studio đang tắt</CardTitle>
              <CardDescription className="text-white/70">
                Cần cấu hình biến môi trường để bật trang admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-white/80">
                Thêm <span className="font-mono">ADMIN_TOOL_PASSWORD</span> vào file <span className="font-mono">.env</span> rồi restart server.
              </div>
              <div className="text-xs text-white/60">
                Ví dụ: <span className="font-mono">ADMIN_TOOL_PASSWORD=your-strong-password</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </div>
    </div>
  )
}
