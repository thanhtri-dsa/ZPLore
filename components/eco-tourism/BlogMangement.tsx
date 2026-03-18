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
import { Pencil, Trash2, Search, Plus, Filter, RefreshCw, Calendar, Tag, BookOpen, MoreHorizontal, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
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

interface Blog {
  id: string
  title: string
  createdAt: string
  tags: string[]
  author?: string
  status?: 'published' | 'draft'
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const ITEMS_PER_PAGE = 8

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/blogs')
      if (!response.ok) throw new Error('Failed to fetch blogs')
      const data = await response.json()
      setBlogs(Array.isArray(data) ? data : [])
      setFilteredBlogs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
      setBlogs([])
      setFilteredBlogs([])
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể lấy danh sách bài viết.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  useEffect(() => {
    const filtered = blogs.filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredBlogs(filtered)
    setCurrentPage(1)
  }, [searchQuery, blogs])

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentPageData = filteredBlogs.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleEdit = (blogId: string) => {
    router.push(`/admin/create-blogs/${blogId}`)
  }

  const handleDelete = async (blogId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete blog')

      toast({
        title: "Thành công",
        description: "Bài viết đã được gỡ bỏ.",
      })
      fetchBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast({
        title: "Lỗi xóa",
        description: "Không thể xóa bài viết đã chọn.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white">Quản lý bài viết</h2>
          <p className="text-sm text-slate-400 font-bold">Biên tập và xuất bản nội dung truyền cảm hứng du lịch xanh.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBlogs} className="h-9 border-white/10 bg-white/5 shadow-sm text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Đồng bộ
          </Button>
          <Button onClick={() => router.push('/admin/create-blogs')} className="h-9 px-4 eco-gradient text-white shadow-lg shadow-emerald-900/20 text-xs font-black hover:scale-[1.02] transition-all">
            <Plus className="mr-2 h-3.5 w-3.5" /> Viết bài mới
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Tìm kiếm tiêu đề bài viết hoặc thẻ tag..."
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="pl-6 h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Bài viết</TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Tác giả</TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Ngày đăng</TableHead>
                  <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-slate-500">Thẻ tag</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-32 bg-slate-100" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-md bg-slate-100" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-9 w-9 ml-auto rounded-lg bg-slate-100" /></TableCell>
                    </TableRow>
                  ))
                ) : currentPageData.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="h-40 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Không tìm thấy bài viết nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((blog) => (
                    <TableRow key={blog.id} className="h-20 border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{blog.title}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">ID: {blog.id.slice(-8)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-slate-600">
                          {blog.author || 'Quản trị viên'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs font-bold text-slate-400">
                          <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                          {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {blog.tags?.slice(0, 2).map((tag, i) => (
                            <Badge key={i} className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                          blog.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {blog.status || 'published'}
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
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tác vụ</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(blog.id)} className="rounded-xl h-10 cursor-pointer hover:bg-emerald-50 hover:text-white focus:bg-emerald-500 focus:text-white group/item transition-all">
                              <Pencil className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                              <span className="text-xs font-black">Chỉnh sửa</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl h-10 cursor-pointer hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white group/item transition-all">
                              <ExternalLink className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                              <span className="text-xs font-black">Xem bài viết</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 border-slate-50" />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl h-10 cursor-pointer text-red-500 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white group/item transition-all">
                                  <Trash2 className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity" /> 
                                  <span className="text-xs font-black">Gỡ bài viết</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2rem] border-none bg-white shadow-2xl max-w-sm">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-black tracking-tight text-slate-900">Xác nhận xóa</AlertDialogTitle>
                                  <AlertDialogDescription className="text-sm text-slate-500 font-bold">
                                    Xóa vĩnh viễn &quot;{blog.title}&quot; khỏi danh mục bài viết? Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-8 gap-3">
                                  <AlertDialogCancel className="rounded-xl h-11 border-slate-100 bg-slate-50 text-xs font-black text-slate-600 hover:bg-slate-100">Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(blog.id)} className="bg-red-500 hover:bg-red-600 rounded-xl h-11 text-xs font-black">
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
              Hiển thị {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredBlogs.length)} của {filteredBlogs.length}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 transition-all"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-[10px] font-black text-slate-900 px-4 h-9 flex items-center rounded-xl bg-white border border-slate-200">
                Trang {currentPage} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 transition-all"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading || totalPages === 0}
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
