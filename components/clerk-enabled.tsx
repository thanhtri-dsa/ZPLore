'use client'

import React, { createContext, useContext } from 'react'

const ClerkEnabledContext = createContext<boolean>(false)

export function ClerkEnabledProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  return <ClerkEnabledContext.Provider value={enabled}>{children}</ClerkEnabledContext.Provider>
}

export function useClerkEnabled() {
  return useContext(ClerkEnabledContext)
}

