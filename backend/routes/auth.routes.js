import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../lib/db.js"
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from "../lib/validation.js"
import { asyncHandler, formatValidationError } from "../lib/errors.js"

const router = express.Router()

// POST /auth/register - Register a new user
router.post("/register", asyncHandler(async (req, res) => {
  try {
    // Validate input
    const validationResult = registerSchema.safeParse(req.body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ")
      return res.status(400).json({ 
        statusCode: 400,
        message: errorMessage 
      })
    }

    const { email, password } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({ 
        statusCode: 409,
        message: "User already exists with this email" 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    res.status(201).json({ 
      statusCode: 201,
      message: "Registration successful. Please login.",
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error during registration" 
    })
  }
}))

// POST /auth/login - Login user
router.post("/login", asyncHandler(async (req, res) => {
  try {
    // Validate input
    const validationResult = loginSchema.safeParse(req.body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ")
      return res.status(400).json({ 
        statusCode: 400,
        message: errorMessage 
      })
    }

    const { email, password } = validationResult.data

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ 
        statusCode: 404,
        message: "User does not exist. Please check your email or register first." 
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ 
        statusCode: 401,
        message: "Incorrect password. Please try again." 
      })
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    )

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    )

    // Save refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })

    res.status(200).json({
      statusCode: 200,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error during login" 
    })
  }
}))

// POST /auth/refresh - Refresh access token
router.post("/refresh", asyncHandler(async (req, res) => {
  try {
    // Validate input
    const validationResult = refreshTokenSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({ 
        statusCode: 400,
        message: "Refresh token is required" 
      })
    }

    const { refreshToken } = validationResult.data

    // Find user with this refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken }
    })

    if (!user) {
      return res.status(401).json({ 
        statusCode: 401,
        message: "Invalid refresh token" 
      })
    }

    // Verify refresh token
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    } catch (err) {
      return res.status(401).json({ 
        statusCode: 401,
        message: "Refresh token expired or invalid" 
      })
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    )

    res.status(200).json({
      statusCode: 200,
      message: "Token refreshed successfully",
      accessToken: newAccessToken
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error during token refresh" 
    })
  }
}))

// POST /auth/logout - Logout user
router.post("/logout", asyncHandler(async (req, res) => {
  try {
    // Validate input
    const validationResult = logoutSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({ 
        statusCode: 400,
        message: "Refresh token is required" 
      })
    }

    const { refreshToken } = validationResult.data

    // Find and clear refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken }
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null }
      })
    }

    res.status(200).json({ 
      statusCode: 200,
      message: "Logout successful" 
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error during logout" 
    })
  }
}))

export default router