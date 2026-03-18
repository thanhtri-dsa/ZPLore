'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  MapPin, 
  Package, 
  FileText, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Leaf, 
  ChevronRight, 
  Menu, 
  X,
  BookOpen,
  PenTool,
  MessageSquare
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AdminSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

interface NavItem {
  href?: string
  icon: any
  label: string
  children?: {
    href: string
    label: string
    icon?: any
  }[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
  const [openCollapsibles, setOpenCollapsibles] = React.useState<Record<string, boolean>>({
    "Quản lý nội dung": true,
    "Vận hành": true
  })

  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { href: "/admin", icon: LayoutDashboard, label: "Overview" },
      ]
    },
    {
      label: "Inventory",
      items: [
        { 
          icon: MapPin, 
          label: "Destinations",
          children: [
            { href: "/admin/create-destinations", label: "Add New" },
            { href: "/admin/manage-destinations", label: "View All" },
          ]
        },
        { 
          icon: Package, 
          label: "Tour Packages",
          children: [
            { href: "/admin/create-packages", label: "Add New" },
            { href: "/admin/manage-packages", label: "View All" },
          ]
        },
        { 
          icon: PenTool, 
          label: "Blog Posts",
          children: [
            { href: "/admin/create-blogs", label: "Write New" },
            { href: "/admin/manage-blogs", label: "View All" },
          ]
        },
      ]
    },
    {
      label: "Business",
      items: [
        { 
          icon: BookOpen, 
          label: "Bookings",
          children: [
            { href: "/admin/view-bookings", label: "By Destination" },
            { href: "/admin/view-packages", label: "By Package" },
          ]
        },
        {
          icon: Users,
          label: "Customers",
          href: "/admin/customers"
        },
        {
          icon: ImageIcon,
          label: "Media Asset",
          children: [
            { href: "/admin/images", label: "Edit Gallery" },
            { href: "/admin/suggestions", label: "Proposals" },
          ],
        },
        {
          icon: MessageSquare,
          label: "Community",
          href: "/admin/community"
        }
      ]
    }
  ]

  const handleLogout = () => {
    setShowLogoutDialog(true)
  }

  const confirmLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' })
      if (response.ok) {
        router.push('/admin/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const toggleCollapsible = (label: string) => {
    setOpenCollapsibles(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-[2.5rem] border-none saas-glass p-8 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-slate-900">Sign Out</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed mt-2">
              Are you sure you want to end your administrative session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-2xl h-12 border-slate-200 hover:bg-slate-50 transition-all font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-500 hover:bg-red-600 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-red-200 transition-all">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="fixed top-4 left-4 z-30 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/80 backdrop-blur-md rounded-2xl border-white/40 saas-shadow h-12 w-12"
        >
          <Menu className="h-6 w-6 text-slate-600" />
        </Button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-in-out bg-slate-950 backdrop-blur-xl border-r border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center px-8 py-10">
            <Link href="/admin" className="flex items-center space-x-3 group">
              <div className="eco-gradient p-2.5 rounded-[1.25rem] shadow-lg shadow-emerald-900/40 transition-transform group-hover:scale-110 duration-500">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-tighter text-white leading-none">EcoStudio</h2>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1.5 opacity-70">Management</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-10 overflow-y-auto no-scrollbar py-4">
            {groups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-3">
                <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item, index) => {
                    if (item.children) {
                      const isChildActive = item.children.some(child => pathname === child.href)
                      return (
                        <Collapsible
                          key={index}
                          open={openCollapsibles[item.label] || isChildActive}
                          onOpenChange={() => toggleCollapsible(item.label)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`w-full justify-between h-11 px-4 rounded-2xl text-sm font-bold transition-all duration-300 ${isChildActive ? 'bg-white/10 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                              <div className="flex items-center">
                                <div className={`mr-3.5 p-1.5 rounded-lg transition-colors ${isChildActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-slate-500 group-hover:bg-white/10'}`}>
                                  <item.icon className="h-4 w-4" />
                                </div>
                                <span>{item.label}</span>
                              </div>
                              <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-500 text-slate-600 ${openCollapsibles[item.label] || isChildActive ? 'rotate-90 text-emerald-500' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-1 mt-1.5 ml-6 border-l-2 border-white/5 pl-4">
                            {item.children.map((child, childIndex) => {
                              const isChildCurrent = pathname === child.href
                              return (
                                <button
                                  key={childIndex}
                                  onClick={() => {
                                    router.push(child.href)
                                    setIsOpen(false)
                                  }}
                                  className={`w-full flex items-center h-9 px-4 text-xs font-bold rounded-xl transition-all duration-300 ${isChildCurrent ? 'text-emerald-400 bg-white/5' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                  {child.label}
                                </button>
                              )
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    }

                    const isActive = pathname === item.href
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          if (item.href) {
                            router.push(item.href)
                            setIsOpen(false)
                          }
                        }}
                        className={`w-full flex items-center h-11 px-4 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive ? 'eco-gradient text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        <div className={`mr-3.5 p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-6 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-16 px-3 hover:bg-white/10 rounded-[1.5rem] transition-all duration-500 shadow-xl bg-white/5 border border-white/5">
                  <Avatar className="h-10 w-10 rounded-2xl ring-2 ring-emerald-50">
                    <AvatarFallback className="rounded-2xl eco-gradient text-white text-xs font-black">AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start ml-3.5 flex-1 overflow-hidden text-left">
                    <span className="font-bold text-[13px] text-white truncate w-full tracking-tight">Admin Portal</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest truncate w-full opacity-60">Verified Studio</span>
                  </div>
                  <Settings className="h-4 w-4 text-slate-300 ml-auto group-hover:rotate-90 transition-transform duration-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-60 rounded-[1.5rem] saas-glass p-2 mb-4">
                <DropdownMenuItem className="rounded-xl h-11 text-slate-600 font-bold px-4 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <Settings className="mr-3 h-4 w-4 opacity-60" />
                  <span className="text-xs">Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-slate-100/50" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="rounded-xl h-11 text-red-500 font-black px-4 cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  )
}
