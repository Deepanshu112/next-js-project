# Task Manager Backend - Database Migration Guide

## Migration from MongoDB to PostgreSQL with Prisma

### What Changed:
- **Database**: MongoDB Atlas → PostgreSQL (Supabase)
- **ORM**: Mongoose → Prisma
- **Validation**: Manual validation → Zod schemas
- **Error Handling**: Improved with standard HTTP status codes

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Update `.env` file with your Supabase credentials:
```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres
JWT_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret_key
```

### 3. Run Prisma Migrations
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate
```

### 4. Start the Server
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

### 5. View Database (Optional)
```bash
npm run prisma:studio
```

---

## API Response Format

All responses now include a `statusCode` field for clarity:

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {}
}
```

### HTTP Status Codes Used:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid token, expired token)
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict (resource already exists)
- **500**: Internal Server Error

---

## Database Schema

### User Model
```
id: String (Primary Key)
email: String (Unique)
password: String (hashed)
refreshToken: String (nullable)
createdAt: DateTime
updatedAt: DateTime
tasks: Task[] (relation)
```

### Task Model
```
id: String (Primary Key)
title: String
description: String
status: String ("pending" | "completed")
userId: String (Foreign Key)
createdAt: DateTime
updatedAt: DateTime
user: User (relation)
```

---

## Validation Rules

### Registration
- Email: Valid email format
- Password: Minimum 6 characters

### Login
- Email: Valid email format
- Password: Required

### Create Task
- Title: Required, max 255 characters
- Description: Optional, max 1000 characters

### Update Task
- Title: Optional, max 255 characters
- Description: Optional, max 1000 characters
- Status: Optional ("pending" or "completed")

---

## Error Handling Examples

### Validation Error
```json
{
  "statusCode": 400,
  "message": "Email is required, Password must be at least 6 characters"
}
```

### Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

### Not Found
```json
{
  "statusCode": 404,
  "message": "Task not found"
}
```

### Conflict
```json
{
  "statusCode": 409,
  "message": "User already exists with this email"
}
```

---

## Key Features

✅ **Type-Safe Database Queries** with Prisma  
✅ **Runtime Validation** with Zod  
✅ **Standard HTTP Status Codes** (400, 401, 404, 500)  
✅ **Automatic Error Handling** with asyncHandler  
✅ **User-Specific Data** (tasks belong to logged-in user)  
✅ **Pagination, Filtering, and Search** on task list  
✅ **JWT Token Management** (access + refresh tokens)  
✅ **Password Hashing** with bcrypt  

---

## Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Ensure Supabase project is active
- Verify network connectivity

### Migration Errors
```bash
# Reset (deletes all data!)
npx prisma migrate reset

# Or manual reset
npx prisma db push --force-reset
```

### Token Expired
- Frontend should use `/refresh` endpoint to get new access token
- Refresh token stored in `localStorage`

---

## Next Steps

1. ✅ Backend migrations complete
2. Update frontend to use new response format
3. Test all endpoints with new database
4. Deploy to production

For questions, check Prisma docs: https://www.prisma.io/docs/
