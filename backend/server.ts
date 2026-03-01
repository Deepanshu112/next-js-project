import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import prisma from "./lib/db.js"
import authRoutes from "./routes/auth.routes.js"
import taskRoutes from "./routes/task.routes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://next-js-project-topaz-pi.vercel.app/',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    statusCode: 200,
    message: "Server is running",
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    statusCode: 404,
    message: "Route not found" 
  })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal server error"
  
  res.status(statusCode).json({
    statusCode,
    message
  })
})

// Connect to database and start server
async function main() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log("✓ Database connected successfully")
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("✗ Failed to connect to database:", error.message)
    process.exit(1)
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\nShutting down...")
  await prisma.$disconnect()
  process.exit(0)
})

main()
