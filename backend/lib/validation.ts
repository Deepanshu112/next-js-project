import { z } from 'zod'

// Auth Validation Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

// Task Validation Schemas
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().trim().max(1000, 'Description must be less than 1000 characters').optional()
})

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().trim().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['pending', 'completed']).optional()
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['pending', 'completed', 'all']).default('all'),
  search: z.string().trim().optional()
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
