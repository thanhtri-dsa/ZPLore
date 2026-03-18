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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2, ChevronLeft, ChevronRight, Plus, Search, Filter, MoreHorizontal, MapPin, Calendar, RefreshCw, ExternalLink } from 'lucide-react'
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

interface Destination {
  id: string
  name: string
  country: string
  city: string
  amount: number
  tags: string[]
  daysNights: number
  tourType: string
  createdAt: string
}

export default function DestinationManagement() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const ITEMS_PER_PAGE = 8
  
  const fetchDestinations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/destinations')
      if (!response.ok) throw new Error('Failed to fetch destinations')
      const data = await response.json()
      setDestinations(Array.isArray(data) ? data : [])
      setFilteredDestinations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching destinations:', error)
      setDestinations([])
      setFilteredDestinations([])
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể lấy danh sách điểm đến.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDestinations()
  }, [fetchDestinations])

  useEffect(() => {
    const filtered = destinations.filter(dest => 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredDestinations(filtered)
    setCurrentPage(1)
  }, [searchQuery, destinations])

  const totalPages = Math.ceil(filteredDestinations.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentPageData = filteredDestinations.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const isEmptyInventory = !isLoading && destinations.length === 0 && searchQuery.trim() === ''
  const displayStart = filteredDestinations.length === 0 ? 0 : startIndex + 1
  const displayEnd = filteredDestinations.length === 0 ? 0 : Math.min(startIndex + ITEMS_PER_PAGE, filteredDestinations.length)

  const handleEdit = (destinationId: string) => {
    router.push(`/admin/manage-destinations/${destinationId}`)
  }

  const handleDelete = async (destinationId: string) => {
    try {
      const response = await fetch(`/api/destinations/${destinationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete destination')

      toast({
        title: "Thành công",
        description: "Đã xóa điểm đến khỏi hệ thống.",
      })
      fetchDestinations()
    } catch (error) {
      console.error('Error deleting destination:', error)
      toast({
        title: "Lỗi xóa",
        description: "Không thể xóa điểm đến đã chọn.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white">Quản lý điểm đến</h2>
          <p className="text-sm text-slate-400 font-bold">Quản lý danh mục du lịch toàn cầu và cài đặt khu vực.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDestinations} className="h-9 border-white/10 bg-white/5 shadow-sm text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Đồng bộ
          </Button>
          <Button onClick={() => router.push('/admin/create-destinations')} className="h-9 px-4 eco-gradient text-white shadow-lg shadow-emerald-900/20 text-xs font-black hover:scale-[1.02] transition-all">
            <Plus className="mr-2 h-3.5 w-3.5" /> Thêm điểm đến
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Tìm kiếm theo tên, thành phố, quốc gia..."
                className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm text-slate-900 transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          {isEmptyInventory ? (
            <div className="p-8 md:p-10">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                        <MapPin className="h-3.5 w-3.5" />
                        Bắt đầu
                      </div>
                      <div className="text-2xl font-black text-slate-900">Chưa có điểm đến nào</div>
                      <div className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                        Thêm điểm đến đầu tiên để mở khóa quản lý gói tour, đặt chỗ và nội dung liên quan.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchDestinations}
                        className="h-10 px-4 rounded-xl border-slate-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Đồng bộ
                      </Button>
                      <Button
                        onClick={() => router.push('/admin/create-destinations')}
                        className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm điểm đến
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white border border-slate-100 p-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gợi ý 1</div>
                      <div className="mt-2 text-sm font-black text-slate-900">Tên + vị trí rõ ràng</div>
                      <div className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">Ưu tiên tên chuẩn + thành phố/quốc gia để tìm kiếm nhanh.</div>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-100 p-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gợi ý 2</div>
                      <div className="mt-2 text-sm font-black text-slate-900">Tag ngắn gọn</div>
                      <div className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">Dùng 2–5 tag để phân loại (eco, bike, hiking...).</div>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-100 p-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gợi ý 3</div>
                      <div className="mt-2 text-sm font-black text-slate-900">Giá & thời lượng</div>
                      <div className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">Thiết lập giá cơ bản và số ngày để định dạng gói tour.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Checklist</div>
                  <div className="mt-4 space-y-3">
                    {[
                      'Tạo điểm đến đầu tiên',
                      'Kiểm tra lại danh sách',
                      'Bắt đầu tạo gói tour',
                    ].map((t, idx) => (
                      <div key={t} className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </div>
                        <div className="text-sm font-bold text-slate-700 leading-snug">{t}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => router.push('/admin/create-destinations')}
                    className="mt-6 w-full h-11 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800"
                  >
                    Tạo điểm đến ngay
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="pl-6 h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Điểm đến</TableHead>
                      <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Vị trí</TableHead>
                      <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Thời gian</TableHead>
                      <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Giá cơ bản</TableHead>
                      <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Phân loại</TableHead>
                      <TableHead className="text-right pr-6 h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i} className="h-20 border-slate-50">
                          <TableCell className="pl-6"><Skeleton className="h-4 w-48 bg-slate-100" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32 bg-slate-100" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 bg-slate-100" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 bg-slate-100" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32 bg-slate-100" /></TableCell>
                          <TableCell className="pr-6"><Skeleton className="h-9 w-9 ml-auto rounded-lg bg-slate-100" /></TableCell>
                        </TableRow>
                      ))
                    ) : currentPageData.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="py-10 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                              Không tìm thấy điểm đến nào
                            </div>
                            {searchQuery.trim() ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                                className="h-9 rounded-xl border-slate-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              >
                                Xóa tìm kiếm
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentPageData.map((destination) => (
                        <TableRow key={destination.id} className="h-20 border-slate-50 hover:bg-slate-50/50 transition-colors group">
                          <TableCell className="pl-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{destination.name}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{destination.tourType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-xs font-bold text-slate-600">
                              <MapPin className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                              {destination.city}, {destination.country}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-xs font-bold text-slate-600">
                              <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                              {destination.daysNights} ngày
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-black text-slate-900">${destination.amount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {destination.tags?.slice(0, 2).map((tag, i) => (
                                <Badge key={i} className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  {tag}
                                </Badge>
                              ))}
                              {destination.tags?.length > 2 && (
                                <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded-md border-slate-200 text-slate-400">
                                  +{destination.tags.length - 2}
                                </Badge>
                              )}
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
                                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quản lý</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(destination.id)} className="rounded-xl h-10 cursor-pointer hover:bg-emerald-50 hover:text-white focus:bg-emerald-500 focus:text-white group/item transition-all">
                                  <Pencil className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                  <span className="text-xs font-black">Chỉnh sửa</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl h-10 cursor-pointer hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white group/item transition-all">
                                  <ExternalLink className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                  <span className="text-xs font-black">Xem công khai</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 border-slate-50" />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl h-10 cursor-pointer text-red-500 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white group/item transition-all">
                                      <Trash2 className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                      <span className="text-xs font-black">Xóa dữ liệu</span>
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-[2rem] border-none bg-white shadow-2xl max-w-sm">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-xl font-black tracking-tight text-slate-900">Xác nhận xóa</AlertDialogTitle>
                                      <AlertDialogDescription className="text-sm text-slate-500 font-bold">
                                        Hành động này sẽ xóa vĩnh viễn &quot;{destination.name}&quot; khỏi cơ sở dữ liệu.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-8 gap-3">
                                      <AlertDialogCancel className="rounded-xl h-11 border-slate-100 bg-slate-50 text-xs font-black text-slate-600 hover:bg-slate-100">Hủy</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(destination.id)} className="bg-red-500 hover:bg-red-600 rounded-xl h-11 text-xs font-black">
                                        Xác nhận xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/50">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Hiển thị {displayStart} - {displayEnd} của {filteredDestinations.length}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 transition-all"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading || totalPages <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-[10px] font-black text-slate-900 px-4 h-9 flex items-center rounded-xl bg-white border border-slate-200">
                    Trang {totalPages === 0 ? 0 : currentPage} / {totalPages || 0}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 transition-all"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading || totalPages <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
