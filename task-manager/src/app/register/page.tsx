'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Link from 'next/link'

interface RegisterFormData {
  email: string
  password: string
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>()
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null)
    try {
      await api.post('/auth/register', data)
      alert('Registration successful. Please login.')
      router.push('/')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      setApiError(errorMessage)
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
          <h2 className="text-2xl font-semibold text-white">Create account</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Welcome. Let&apos;s get you started.
          </p>
        </div>

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
          <label className="block text-sm text-neutral-400 mb-1">Email</label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              },
              onChange: () => setApiError(null)
            })}
            placeholder="you@example.com"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3
                   text-white placeholder-neutral-500 focus:outline-none 
                   focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1 pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm text-neutral-400 mb-1">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              },
              onChange: () => setApiError(null)
            })}
            placeholder="••••••••"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3
                   text-white placeholder-neutral-500 focus:outline-none 
                   focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1 pl-1">{errors.password.message}</p>
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
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>

        {/* Footer */}
        <p className="text-sm text-neutral-400 text-center mt-6">
          Already have an account?{' '}
          <Link
            href="/"
            className="text-white font-medium hover:text-neutral-300 hover:underline 
                     transition-colors inline-flex items-center gap-1"
          >
            Login
            <span className="text-lg">→</span>
          </Link>
        </p>
      </form>
    </div>
  )
}