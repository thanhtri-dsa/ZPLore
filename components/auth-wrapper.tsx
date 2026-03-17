import { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import config from '@/config'
import { ClerkEnabledProvider } from '@/components/clerk-enabled'

interface AuthWrapperProps {
  children: ReactNode
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const hasClerkKeys =
    typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'string' &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.trim() !== '';
  const hasClerkSecret = typeof process.env.CLERK_SECRET_KEY === 'string' && process.env.CLERK_SECRET_KEY.trim() !== '';
  const clerkEnabled = hasClerkKeys && hasClerkSecret && (process.env.NODE_ENV === 'production' || process.env.FORCE_CLERK_AUTH === 'true')

  if (!config.auth.enabled || !clerkEnabled) {
    return <ClerkEnabledProvider enabled={false}>{children}</ClerkEnabledProvider>
  }

  return <ClerkEnabledProvider enabled={true}><ClerkProvider dynamic>{children}</ClerkProvider></ClerkEnabledProvider>
};

export default AuthWrapper
