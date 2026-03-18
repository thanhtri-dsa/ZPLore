'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Leaf, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null
        setError(json?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại mật khẩu.')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-secondary/5 blur-[120px] rounded-full -translate-x-1/2" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-2xl mb-4 shadow-xl">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Làng Nghề Travel Admin</h1>
          <p className="text-muted-foreground mt-2">Hệ thống quản trị tour làng nghề</p>
        </div>

        <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl overflow-hidden rounded-[2rem]">
          <CardHeader className="pt-8 px-8 pb-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Xác thực truy cập
            </CardTitle>
            <CardDescription>
              Vui lòng nhập mã bảo mật để tiếp tục vào hệ thống quản trị.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Mã bảo mật
                </label>
                <div className="relative group">
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••••••"
                    className="h-14 rounded-2xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 text-lg transition-all"
                    autoFocus
                  />
                </div>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-destructive font-medium flex items-center gap-2 ml-1"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    {error}
                  </motion.div>
                )}
              </div>

              <Button 
                disabled={loading || password.trim().length === 0} 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 group transition-all"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Tiếp tục
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} Làng Nghề Travel. Tất cả quyền được bảo lưu.
        </p>
      </motion.div>
    </div>
  )
}
