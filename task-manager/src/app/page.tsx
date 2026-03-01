'use client'

import { useForm } from 'react-hook-form'
import { useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import { AuthContext } from '@/context/AuthContext'
import Link from 'next/link'


interface LoginFormData {
  email: string
  password: string
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>()
  const router = useRouter()
  const { login } = useContext(AuthContext)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // If we have a token from context (already logged in), go to dashboard
    const storedToken = localStorage.getItem('token') || document.cookie.includes('token')
    if (storedToken) {
      router.push('/dashboard')
    }
  }, [router])

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null)

    try {
      const response = await api.post('/auth/login', data)

      // Get tokens from response
      const { accessToken, refreshToken, user } = response.data

      // Save tokens and user info in context (which also sets the cookie)
      login(accessToken, refreshToken, user)

      // Force a hard navigation to bust the Next.js App Router Cache entirely
      // This is the most reliable way to sync middleware state after login
      window.location.href = '/dashboard'

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed'

      if (errorMessage.includes('does not exist')) {
        setApiError('User does not exist. Please check your email or register.')
      } else if (errorMessage.includes('Incorrect password')) {
        setApiError('Incorrect password. Please try again.')
      } else {
        setApiError(errorMessage)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-neutral-950 to-neutral-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 
               rounded-xl p-8 shadow-2xl transition-all duration-200
               hover:shadow-neutral-900/50 hover:border-neutral-700"
        noValidate
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Task Manager
          </h1>
          <h2 className="text-2xl font-semibold text-white mt-2">Login</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Welcome back. Please sign in to continue.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-3 bg-green-900/30 border border-green-800/50 rounded-lg">
            <p className="text-green-300 text-sm flex items-center gap-2">
              <span className="text-lg">✓</span>
              Login successful! Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* API Error Message */}
        {apiError && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800/50 rounded-lg">
            <p className="text-red-300 text-sm flex items-center gap-2">
              <span className="text-lg">⚠</span>
              {apiError}
            </p>
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm text-neutral-400 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              },
              onChange: () => setApiError(null) // Clear error when user types
            })}
            placeholder="you@example.com"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3
                   text-white placeholder-neutral-500 focus:outline-none 
                   focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-error"
          />
          {errors.email && (
            <p id="email-error" className="text-red-400 text-sm mt-1 pl-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm text-neutral-400">
              Password
            </label>
            <button
              type="button"
              onClick={() => alert('Please contact support to reset your password')}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              },
              onChange: () => setApiError(null) // Clear error when user types
            })}
            placeholder="••••••••"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3
                   text-white placeholder-neutral-500 focus:outline-none 
                   focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby="password-error"
          />
          {errors.password && (
            <p id="password-error" className="text-red-400 text-sm mt-1 pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg font-medium bg-gradient-to-r from-white to-neutral-200 
                 text-black hover:from-neutral-200 hover:to-neutral-300 
                 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-150 flex items-center justify-center gap-2
                 shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>

        {/* Demo Credentials (Optional - for testing) */}
        <div className="mt-6 p-3 bg-neutral-950/50 border border-neutral-800 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">For testing:</p>
          <p className="text-xs text-neutral-400">Email: test@example.com</p>
          <p className="text-xs text-neutral-400">Password: password123</p>
        </div>

        {/* Footer */}
        <p className="text-sm text-neutral-400 text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-white font-medium hover:text-neutral-300 hover:underline 
                     transition-colors inline-flex items-center gap-1"
          >
            Register here
            <span className="text-lg">→</span>
          </Link>
        </p>
      </form>
    </div>
  )
}