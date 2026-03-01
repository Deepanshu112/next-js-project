import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://internship-task-zwdl.onrender.com/api',
  // baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'https://internship-task-zwdl.onrender.com/api'}/auth/refresh`,
              { refreshToken }
            )
            const newAccessToken = refreshResponse.data.accessToken
            localStorage.setItem('accessToken', newAccessToken)
            
            // Retry original request with new token
            error.config.headers.Authorization = `Bearer ${newAccessToken}`
            return api(error.config)
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/'
          }
        } else {
          // No refresh token, redirect to login
          localStorage.removeItem('accessToken')
          window.location.href = '/'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
