import jwt from "jsonwebtoken"
import { errorResponses } from "../lib/errors.js"

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ 
        message: "No token, authorization denied",
        statusCode: 401
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token has expired",
        statusCode: 401
      })
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token",
        statusCode: 401
      })
    }

    res.status(401).json({ 
      message: "Authentication failed",
      statusCode: 401
    })
  }
}

export default authMiddleware
