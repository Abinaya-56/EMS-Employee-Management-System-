# HR Management System (EMS)

A simple full-stack JavaScript HR management system with:
- Staff and HR admin login
- Staff attendance marking (present/absent)
- Staff leave request with status tracking
- HR announcements visible to all staff
- HR chatbot panel
- Individual employee performance and attendance analytics
- Department-level performance overview

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT

## Project Structure

```
EMS/
  client/        # React frontend
  server/        # Node/Express backend
  package.json   # Root scripts for running both apps
```

## Quick Start
1. Install all dependencies:
   - `npm run install:all`
2. Ensure MongoDB is running on your machine:
   - `mongodb://127.0.0.1:27017/ems`
3. Run both apps:
   - `npm run dev`

## Default Login Accounts (Auto-seeded)
When MongoDB is connected and the users collection is empty, these are created automatically:
- HR Admin: `hr@ems.com` / `admin123`
- Staff: `staff@ems.com` / `staff123`

## Default Ports
- Client: 5173
- Server: 5000

## Key API Areas
- `/api/auth`
- `/api/attendance`
- `/api/leave-requests`
- `/api/performance`
- `/api/chatbot` (HR admin only)
- `/api/announcements`
- `/api/users`
- `/api/analytics`
