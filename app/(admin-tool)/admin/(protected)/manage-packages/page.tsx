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
import { Pencil, Trash2, ChevronLeft, ChevronRight, Plus, Search, Filter, MoreHorizontal, Calendar, RefreshCw, ExternalLink, Package, MapPin } from 'lucide-react'
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

interface TourPackage {
  id: string
  name: string
  destinationName: string
  price: number
  duration: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  type: string
  createdAt: string
}

export default function PackageManagement() {
  const [packages, setPackages] = useState<TourPackage[]>([])
  const [filteredPackages, setFilteredPackages] = useState<TourPackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [packageToDelete, setPackageToDelete] = useState<TourPackage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const ITEMS_PER_PAGE = 8
  
  const fetchPackages = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/packages')
      if (!response.ok) throw new Error('Failed to fetch packages')
      const data = await response.json()
      setPackages(Array.isArray(data) ? data : [])
      setFilteredPackages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      setPackages([])
      setFilteredPackages([])
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể lấy danh sách gói tour.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  useEffect(() => {
    const filtered = packages.filter(pkg => 
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destinationName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredPackages(filtered)
    setCurrentPage(1)
  }, [searchQuery, packages])

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentPageData = filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const isEmptyInventory = !isLoading && packages.length === 0 && searchQuery.trim() === ''
  const displayStart = filteredPackages.length === 0 ? 0 : startIndex + 1
  const displayEnd = filteredPackages.length === 0 ? 0 : Math.min(startIndex + ITEMS_PER_PAGE, filteredPackages.length)

  const handleEdit = (packageId: string) => {
    router.push(`/admin/manage-packages/${packageId}`)
  }

  const handleDelete = async () => {
    if (!packageToDelete) return
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/packages/${packageToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to delete package')
      }

      toast({
        title: "Thành công",
        description: "Gói tour đã được xóa khỏi hệ thống.",
      })
      setPackageToDelete(null)
      fetchPackages()
    } catch (error) {
      console.error('Error deleting package:', error)
      toast({
        title: "Lỗi xóa",
        description: error instanceof Error ? error.message : "Không thể xóa gói tour đã chọn.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white">Quản lý gói tour</h2>
          <p className="text-sm text-slate-400 font-bold">Cấu hình và triển khai các trải nghiệm du lịch đặc sắc.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPackages} className="h-9 border-white/10 bg-white/5 shadow-sm text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Đồng bộ
          </Button>
          <Button onClick={() => router.push('/admin/create-packages')} className="h-9 px-4 eco-gradient text-white shadow-lg shadow-emerald-900/20 text-xs font-black hover:scale-[1.02] transition-all">
            <Plus className="mr-2 h-3.5 w-3.5" /> Thêm gói tour
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Tìm kiếm gói tour hoặc điểm đến..."
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
                        <Package className="h-3.5 w-3.5" />
                        Bắt đầu
                      </div>
                      <div className="text-2xl font-black text-slate-900">Chưa có gói tour nào</div>
                      <div className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                        Tạo gói tour đầu tiên để khách có thể xem chi tiết, đặt chỗ và chia sẻ trong cộng đồng.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPackages}
                        className="h-10 px-4 rounded-xl border-slate-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Đồng bộ
                      </Button>
                      <Button
                        onClick={() => router.push('/admin/create-packages')}
                        className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm gói tour
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white border border-slate-100 p-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gợi ý 1</div>
                      <div className="mt-2 text-sm font-black text-slate-900">Mô tả ngắn gọn</div>
                      <div className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">Tập trung vào trải nghiệm xanh và lợi ích chính.</div>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-100 p-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gợi ý 2</div>
                      <div className="mt-2 text-sm font-black text-slate-900">Giá minh bạch</div>
                      <div className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">Thiết lập giá và nhóm khách để dễ chốt.</div>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-100 p-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gợi ý 3</div>
                      <div className="mt-2 text-sm font-black text-slate-900">Thời lượng hợp lý</div>
                      <div className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">Đặt 1–3 ngày cho tour ngắn, 4–7 ngày cho tour dài.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Checklist</div>
                  <div className="mt-4 space-y-3">
                    {[
                      'Tạo gói tour đầu tiên',
                      'Kiểm tra hiển thị danh sách',
                      'Bật trạng thái hoạt động',
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
                    onClick={() => router.push('/admin/create-packages')}
                    className="mt-6 w-full h-11 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800"
                  >
                    Tạo gói tour ngay
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
                      <TableHead className="pl-6 h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Thông tin gói</TableHead>
                      <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Điểm đến</TableHead>
                      <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Thời gian</TableHead>
                      <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Giá tour</TableHead>
                      <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</TableHead>
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
                              Không tìm thấy gói tour nào
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
                      currentPageData.map((pkg) => (
                        <TableRow key={pkg.id} className="h-20 border-slate-50 hover:bg-slate-50/50 transition-colors group">
                          <TableCell className="pl-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{pkg.name}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{pkg.type || 'Standard Tour'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-xs font-bold text-slate-600">
                              <MapPin className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                              {pkg.destinationName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-xs font-bold text-slate-600">
                              <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                              {pkg.duration}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-black text-slate-900">${pkg.price?.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                              pkg.status === 'ACTIVE' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {pkg.status || 'ACTIVE'}
                            </Badge>
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
                                <DropdownMenuItem onClick={() => handleEdit(pkg.id)} className="rounded-xl h-10 cursor-pointer hover:bg-emerald-50 hover:text-white focus:bg-emerald-500 focus:text-white group/item transition-all">
                                  <Pencil className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                  <span className="text-xs font-black">Chỉnh sửa</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl h-10 cursor-pointer hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white group/item transition-all">
                                  <ExternalLink className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                  <span className="text-xs font-black">Xem trước</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 border-slate-50" />
                                <DropdownMenuItem 
                                  onClick={() => setPackageToDelete(pkg)} 
                                  className="rounded-xl h-10 cursor-pointer text-red-500 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white group/item transition-all"
                                >
                                  <Trash2 className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                  <span className="text-xs font-black">Xóa gói tour</span>
                                </DropdownMenuItem>
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
                  Hiển thị {displayStart} - {displayEnd} của {filteredPackages.length}
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

      <AlertDialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none bg-white shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tight text-slate-900">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 font-bold">
              Xóa &quot;{packageToDelete?.name}&quot; khỏi danh mục đang hoạt động? Hành động này không thể hoàn tác dễ dàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-xl h-11 border-slate-100 bg-slate-50 text-xs font-black text-slate-600 hover:bg-slate-100">Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 rounded-xl h-11 text-xs font-black"
            >
              {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
