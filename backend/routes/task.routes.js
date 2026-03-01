import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import prisma from "../lib/db.js"
import { createTaskSchema, updateTaskSchema, paginationSchema } from "../lib/validation.js"
import { asyncHandler } from "../lib/errors.js"

const router = express.Router()

// GET /tasks - Fetch all tasks with pagination, filtering, and searching
router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  try {
    // Validate pagination and filter parameters
    const validationResult = paginationSchema.safeParse(req.query)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ")
      return res.status(400).json({ 
        statusCode: 400,
        message: errorMessage 
      })
    }

    const { page, limit, status, search } = validationResult.data

    // Build filter object
    const where = { userId: req.userId }

    // Add status filter
    if (status && status !== "all") {
      where.status = status
    }

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count
    const total = await prisma.task.count({ where })

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip
    })

    res.status(200).json({
      statusCode: 200,
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error fetching tasks" 
    })
  }
}))

// GET /tasks/:id - Get single task
router.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId
      }
    })

    if (!task) {
      return res.status(404).json({ 
        statusCode: 404,
        message: "Task not found" 
      })
    }

    res.status(200).json({
      statusCode: 200,
      task
    })
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error fetching task" 
    })
  }
}))

// POST /tasks - Create new task
router.post("/", authMiddleware, asyncHandler(async (req, res) => {
  try {
    // Validate input
    const validationResult = createTaskSchema.safeParse(req.body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ")
      return res.status(400).json({ 
        statusCode: 400,
        message: errorMessage 
      })
    }

    const { title, description } = validationResult.data

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        userId: req.userId
      }
    })

    res.status(201).json({
      statusCode: 201,
      message: "Task created successfully",
      task
    })
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error creating task" 
    })
  }
}))

// PATCH /tasks/:id - Update task partially
router.patch("/:id", authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    // Validate input
    const validationResult = updateTaskSchema.safeParse(req.body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ")
      return res.status(400).json({ 
        statusCode: 400,
        message: errorMessage 
      })
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId
      }
    })

    if (!existingTask) {
      return res.status(404).json({ 
        statusCode: 404,
        message: "Task not found" 
      })
    }

    const updateData = {}
    if (req.body.title !== undefined) updateData.title = req.body.title
    if (req.body.description !== undefined) updateData.description = req.body.description
    if (req.body.status !== undefined) updateData.status = req.body.status

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    })

    res.status(200).json({
      statusCode: 200,
      message: "Task updated successfully",
      task
    })
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error updating task" 
    })
  }
}))

// PUT /tasks/:id - Full update (backward compatibility)
router.put("/:id", authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId
      }
    })

    if (!existingTask) {
      return res.status(404).json({ 
        statusCode: 404,
        message: "Task not found" 
      })
    }

    const updateData = {}
    if (req.body.title !== undefined) updateData.title = req.body.title
    if (req.body.description !== undefined) updateData.description = req.body.description
    if (req.body.status !== undefined) updateData.status = req.body.status

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    })

    res.status(200).json({
      statusCode: 200,
      message: "Task updated successfully",
      task
    })
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error updating task" 
    })
  }
}))

// POST /tasks/:id/toggle - Toggle task status
router.post("/:id/toggle", authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId
      }
    })

    if (!task) {
      return res.status(404).json({ 
        statusCode: 404,
        message: "Task not found" 
      })
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: task.status === "pending" ? "completed" : "pending"
      }
    })

    res.status(200).json({
      statusCode: 200,
      message: "Task status updated",
      task: updatedTask
    })
  } catch (error) {
    console.error("Error toggling task:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error toggling task" 
    })
  }
}))

// DELETE /tasks/:id - Delete task
router.delete("/:id", authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId
      }
    })

    if (!task) {
      return res.status(404).json({ 
        statusCode: 404,
        message: "Task not found" 
      })
    }

    await prisma.task.delete({
      where: { id }
    })

    res.status(200).json({ 
      statusCode: 200,
      message: "Task deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ 
      statusCode: 500,
      message: "Server error deleting task" 
    })
  }
}))

export default router
