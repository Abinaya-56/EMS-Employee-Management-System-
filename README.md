# HR Management System (EMS)

A full-stack JavaScript HR management system with:
- Employee attendance management
- Leave request workflow
- Performance tracking
- Role-based access for admin and employee
- AI chatbot endpoint for employee-related queries

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
2. Copy environment templates:
   - `cp server/.env.example server/.env`
   - `cp client/.env.example client/.env`
3. Start the backend in one terminal:
   - `cd server`
   - `npm run dev`
4. Start the frontend in a second terminal:
   - `cd client`
   - `npm run dev`
5. Open the app in your browser:
   - `http://localhost:5173`

If Vite uses a different port, open the port shown in the terminal output.

When you want to run the project again later, repeat the same backend and frontend steps and keep both terminals open while using the browser.

## Default Ports
- Client: 5173
- Server: 5000

## Key API Areas
- `/api/auth`
- `/api/attendance`
- `/api/leave-requests`
- `/api/performance`
- `/api/chatbot`
