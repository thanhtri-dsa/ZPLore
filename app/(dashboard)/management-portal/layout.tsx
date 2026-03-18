"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/eco-tourism/sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const getPortalTitle = (path: string) => {
      if (path === '/management-portal/dashboard') return 'Dashboard'
      if (path === '/management-portal/create-packages') return 'Create Package'
      if (path.startsWith('/management-portal/create-packages/')) return 'Edit Package'
      if (path === '/management-portal/manage-packages') return 'Manage Packages'
      if (path.startsWith('/management-portal/manage-packages/')) return 'Edit Package'
      if (path === '/management-portal/create-destinations') return 'Create Destination'
      if (path === '/management-portal/manage-destinations') return 'Manage Destinations'
      if (path.startsWith('/management-portal/manage-destinations/')) return 'Edit Destination'
      if (path.startsWith('/management-portal/edit-destinations/')) return 'Edit Destination'
      if (path === '/management-portal/create-blogs') return 'Create Blog'
      if (path.startsWith('/management-portal/create-blogs/')) return 'Edit Blog'
      if (path === '/management-portal/manage-blogs') return 'Manage Blogs'
      if (path === '/management-portal/view-bookings') return 'Bookings'
      if (path === '/management-portal/view-packages') return 'Packages'
      if (path === '/management-portal/customers') return 'Customers'
      if (path.startsWith('/management-portal/customers/')) return 'Customer'
      if (path === '/management-portal/images') return 'Images'
      if (path === '/management-portal/image-suggestions') return 'Image Suggestions'
      if (path === '/management-portal/settings') return 'Settings'
      if (path === '/management-portal/user-profile') return 'User Profile'
      return 'Management Portal'
    }

    document.title = `${getPortalTitle(pathname)} | Forestline Tours`
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 p-2 sm:p-4 md:p-6 md:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
