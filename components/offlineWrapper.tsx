'use client'

import { ReactNode } from "react"
import { OfflineBanner } from "@/components/offlineBanner"

interface OfflineWrapperProps {
  children: ReactNode
}

export function OfflineWrapper({ children }: OfflineWrapperProps) {
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  )
}

