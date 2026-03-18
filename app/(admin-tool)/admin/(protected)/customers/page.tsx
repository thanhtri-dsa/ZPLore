'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Calendar, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Customer {
  id: string
  firstname: string
  lastname: string
  email: string
  phone: string
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED'
  createdAt: string
  bookingsCount?: number
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const LIMIT = 8

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/customers?limit=100')
      if (!res.ok) throw new Error('Failed to fetch customers')
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : (data.customers || []))
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: "Lỗi cơ sở dữ liệu",
        description: "Không thể đồng bộ hồ sơ khách hàng.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filtered = customers.filter(c => 
    `${c.firstname} ${c.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / LIMIT)
  const currentPageData = filtered.slice((page - 1) * LIMIT, page * LIMIT)

  const gotoCustomer = (id: string) => {
    router.push(`/admin/customers/${id}`)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-1">
            <Users className="h-3 w-3" />
            <span>Quản lý quan hệ khách hàng</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">Cộng đồng Explorer</h2>
          <p className="text-sm text-slate-400 font-bold max-w-xl">
            Theo dõi sự tương tác, hồ sơ và lịch sử đặt chỗ của người dùng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchCustomers} className="h-10 px-4 border-white/10 bg-white/5 text-xs font-black text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
          </Button>
          <Button className="h-10 px-5 eco-gradient text-white shadow-lg shadow-emerald-900/20 text-xs font-black hover:scale-[1.02] transition-all">
            <Zap className="mr-2 h-3.5 w-3.5 fill-current" /> Báo cáo phân tích
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Tìm kiếm khách hàng theo tên, email..."
                className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm text-slate-900 transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
                <Filter className="mr-2 h-4 w-4" /> Lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent border-slate-100 h-12">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Explorer</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Liên hệ</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tương tác</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ngày gia nhập</TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(LIMIT).fill(0).map((_, i) => (
                    <TableRow key={i} className="h-20 border-slate-50">
                      <TableCell className="pl-6"><Skeleton className="h-10 w-48 rounded-lg bg-slate-100" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32 bg-slate-100" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 bg-slate-100" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-md bg-slate-100" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 bg-slate-100" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-9 w-9 ml-auto rounded-lg bg-slate-100" /></TableCell>
                    </TableRow>
                  ))
                ) : currentPageData.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="h-40 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Không tìm thấy khách hàng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((customer) => {
                    const fullName = `${customer.firstname} ${customer.lastname}`
                    return (
                      <TableRow key={customer.id} className="h-20 border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-100 ring-2 ring-emerald-500/10 ring-offset-2 ring-offset-white">
                              <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-xs">
                                {customer.firstname[0]}{customer.lastname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                                {fullName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: {customer.id.slice(-8)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-xs font-bold text-slate-600">
                              <Mail className="mr-2 h-3 w-3 text-slate-400" />
                              {customer.email}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold">{customer.phone || 'Không có số điện thoại'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-black px-2 py-0.5 rounded-md border-slate-100 bg-slate-50 text-slate-500">
                              {customer.bookingsCount || 0} Đặt chỗ
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex">
                            <Badge className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                              customer.status === 'ACTIVE' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {customer.status || 'ACTIVE'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-xs text-slate-500 font-bold">
                            <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                            {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-slate-100 bg-white p-2 mt-2 shadow-2xl">
                              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hành động</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => gotoCustomer(customer.id)} className="rounded-xl h-10 cursor-pointer hover:bg-emerald-50 hover:text-white focus:bg-emerald-500 focus:text-white group/item transition-all">
                                <UserCheck className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                <span className="text-xs font-black">Xem hồ sơ</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl h-10 cursor-pointer hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white group/item transition-all">
                                <Mail className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                <span className="text-xs font-black">Gửi tin nhắn</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-2 border-slate-50" />
                              <DropdownMenuItem className="rounded-xl h-10 cursor-pointer text-red-500 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white group/item transition-all">
                                <ShieldAlert className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                <span className="text-xs font-black">Khóa tài khoản</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/50">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Hiển thị {Math.min(filtered.length, (page - 1) * LIMIT + 1)} - {Math.min(page * LIMIT, filtered.length)} của {filtered.length}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 transition-all"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-[10px] font-black text-slate-900 px-4 h-9 flex items-center rounded-xl bg-white border border-slate-200">
                Trang {page} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 transition-all"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || isLoading || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
