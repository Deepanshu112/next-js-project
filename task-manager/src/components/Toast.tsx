'use client'

import { useState, useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: 'bg-green-900/90',
    error: 'bg-red-900/90',
    info: 'bg-blue-900/90'
  }[type]

  const borderColor = {
    success: 'border-green-800',
    error: 'border-red-800',
    info: 'border-blue-800'
  }[type]

  return (
    <div className={`fixed top-4 right-4 ${bgColor} ${borderColor} border rounded-lg p-4 
                   text-white shadow-lg z-50 animate-slide-in`}>
      {message}
    </div>
  )
}