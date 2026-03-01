'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  accessToken: string | null
  refreshToken: string | null
  login: (accessToken: string, refreshToken: string, userData?: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  accessToken: null,
  refreshToken: null,
  login: () => { },
  logout: () => { },
})

interface AuthProviderProps {
  children: ReactNode
}

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null)
//   const [token, setToken] = useState<string | null>(null)

//   useEffect(() => {
//     // Initialize from localStorage on client side
//     const storedToken = localStorage.getItem('token')
//     if (storedToken) {
//       setToken(storedToken)
//     }
//   }, [])

//   const login = (newToken: string) => {
//     localStorage.setItem('token', newToken)
//     setToken(newToken)
//     // You might want to decode the token to get user info
//     // const decoded = jwt.decode(newToken)
//     // setUser(decoded)
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     setToken(null)
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedAccessToken) setAccessToken(storedAccessToken)
    if (storedRefreshToken) setRefreshToken(storedRefreshToken)
    if (storedToken) setToken(storedToken)
    if (storedUser) setUser(JSON.parse(storedUser))

    setIsLoading(false)
  }, [])

  const login = (newAccessToken: string, newRefreshToken: string, userData?: User) => {
    // 1. Set LocalStorage
    localStorage.setItem('accessToken', newAccessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    localStorage.setItem('token', newAccessToken) // Backward compat
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    }

    // 2. Set NextJS Middleware Cookie explicitly
    document.cookie = `token=${newAccessToken}; path=/; max-age=86400; SameSite=Lax`

    // 3. Update React State
    setAccessToken(newAccessToken)
    setRefreshToken(newRefreshToken)
    setToken(newAccessToken)
  }

  const logout = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken')
    if (storedRefreshToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefreshToken })
        })
      } catch (err) {
        console.error('Logout error:', err)
      }
    }

    // 1. Clear LocalStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // 2. Clear NextJS Middleware Cookie aggressively
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'

    // 3. Clear React State
    setAccessToken(null)
    setRefreshToken(null)
    setToken(null)
    setUser(null)
  }

  // Prevent hydration mismatch by not rendering children until initial local storage is read
  if (isLoading) return null

  return (
    <AuthContext.Provider value={{ user, token, accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}