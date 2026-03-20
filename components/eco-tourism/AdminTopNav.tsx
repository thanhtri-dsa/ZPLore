'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Bell, Search, Moon, Sun, LayoutDashboard, Settings, User, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminTopNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const pathSegments = pathname.split('/').filter(segment => segment !== '')
  
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`
    const label = segment === 'admin' ? 'Dashboard' : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    const isLast = index === pathSegments.length - 1

    return { href, label, isLast }
  })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-[#061027]/90 backdrop-blur-xl px-4 md:px-7 lg:px-8">
      <div className="flex flex-1 items-center gap-4">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList className="gap-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <BreadcrumbSeparator className="text-slate-700"><ChevronRight className="h-3.5 w-3.5" /></BreadcrumbSeparator>}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="font-bold text-white text-xs tracking-wide">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      href={crumb.href} 
                      className="text-slate-500 hover:text-emerald-300 transition-colors text-xs font-bold tracking-wide"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:flex items-center group">
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
          <Input
            type="search"
            placeholder="Tim nhanh..."
            className="w-[200px] lg:w-[280px] pl-9 bg-white/5 border-white/10 h-9 rounded-lg text-xs text-white placeholder:text-slate-600 transition-all focus:bg-white/10 focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50"
          />
          <div className="absolute right-2.5 hidden lg:flex items-center gap-1 pointer-events-none">
            <kbd className="h-4 px-1.5 rounded border border-white/10 bg-white/5 text-[9px] font-bold text-slate-500">⌘K</kbd>
          </div>
        </div>
        
        <div className="flex items-center gap-1 border-l border-white/5 pl-3 ml-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-emerald-500 rounded-full ring-2 ring-[#0B1120]" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0.5 h-8 w-8 rounded-full border border-white/10 hover:border-emerald-500/50 transition-all overflow-hidden ring-2 ring-transparent hover:ring-emerald-500/20">
              <Avatar className="h-full w-full">
              <AvatarFallback className="bg-emerald-900/50 text-emerald-300 text-[10px] font-black uppercase">AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border border-white/10 bg-[#0B1120]/95 backdrop-blur-xl p-1.5 mt-2 shadow-2xl shadow-black/50">
            <DropdownMenuLabel className="font-bold text-[10px] uppercase tracking-wider text-slate-500 px-3 py-2">
              Tai khoan quan tri
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 border-white/5" />
            <DropdownMenuItem className="rounded-lg h-9 text-slate-400 cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400">
              <User className="mr-2.5 h-4 w-4" />
              <span className="text-xs font-bold">Ho so cua toi</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg h-9 text-slate-400 cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400">
              <Settings className="mr-2.5 h-4 w-4" />
              <span className="text-xs font-bold">Tuy chon</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
