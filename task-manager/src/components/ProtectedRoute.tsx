'use client'

import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push('/')
    }
  }, [token, router])

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Redirecting to login...</p>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute