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
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  MessageCircle, 
  Calendar, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Heart
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

interface Post {
  id: string
  title: string | null
  content: string
  authorName: string
  likesCount: number
  createdAt: string
  location?: string
}

export default function CommunityModeration() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const LIMIT = 8

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/community/posts?limit=100')
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể lấy danh sách bài viết cộng đồng.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filtered = posts.filter(p => 
    p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / LIMIT)
  const currentPageData = filtered.slice((page - 1) * LIMIT, page * LIMIT)

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      toast({
        title: "Đã gỡ nội dung",
        description: "Bài viết đã được xóa khỏi cộng đồng.",
      })
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast({
        title: "Lỗi kiểm duyệt",
        description: "Không thể xóa bài viết này.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-1">
            <ShieldCheck className="h-3 w-3" />
            <span>Kiểm duyệt cộng đồng</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">Quản lý bài viết</h2>
          <p className="text-sm text-slate-400 font-bold max-w-xl">
            Giám sát các thảo luận, hình ảnh và tương tác của cộng đồng du lịch xanh.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchPosts} className="h-10 px-4 border-white/10 bg-white/5 text-xs font-black text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Tìm kiếm theo tên tác giả hoặc nội dung bài viết..."
                className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm text-slate-900 transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent border-slate-100 h-12">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Tác giả</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nội dung</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tương tác</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ngày đăng</TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(LIMIT).fill(0).map((_, i) => (
                    <TableRow key={i} className="h-24 border-slate-50">
                      <TableCell className="pl-6"><Skeleton className="h-10 w-40 rounded-lg bg-slate-100" /></TableCell>
                      <TableCell><Skeleton className="h-12 w-full bg-slate-100" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 bg-slate-100" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 bg-slate-100" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-9 w-9 ml-auto rounded-lg bg-slate-100" /></TableCell>
                    </TableRow>
                  ))
                ) : currentPageData.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="h-40 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Không có bài viết nào cần kiểm duyệt.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((post) => (
                    <TableRow key={post.id} className="h-24 border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-100">
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-xs">
                              {post.authorName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{post.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{post.location || 'Hành tinh xanh'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="flex flex-col gap-1">
                          {post.title && <div className="text-xs font-black text-slate-900 line-clamp-1">{post.title}</div>}
                          <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.content}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Heart className="h-3.5 w-3.5 fill-red-50 text-red-400" />
                            <span className="text-xs font-bold">{post.likesCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-xs font-bold">...</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs text-slate-400 font-bold">
                          <Calendar className="mr-1.5 h-3.5 w-3.5" />
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
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
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tác vụ kiểm duyệt</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl h-10 cursor-pointer hover:bg-emerald-50 hover:text-white focus:bg-emerald-500 focus:text-white group/item transition-all">
                              <ExternalLink
                                href={`/community/${post.id}/detail`}
                                className="mr-3 h-4 w-4 opacity-50 group-hover/item:opacity-100 transition-opacity"
                              />
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
                                  <AlertDialogTitle className="text-xl font-black tracking-tight text-slate-900">Gỡ nội dung</AlertDialogTitle>
                                  <AlertDialogDescription className="text-sm text-slate-500 font-bold">
                                    Xác nhận gỡ bài viết này khỏi cộng đồng? Hành động này sẽ thông báo cho tác giả về vi phạm quy tắc.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-8 gap-3">
                                  <AlertDialogCancel className="rounded-xl h-11 border-slate-100 bg-slate-50 text-xs font-black text-slate-600 hover:bg-slate-100">Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-red-500 hover:bg-red-600 rounded-xl h-11 text-xs font-black">
                                    Xác nhận gỡ
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
