import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRequestRoutes from "./routes/leaveRequest.routes.js";
import performanceRoutes from "./routes/performance.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import userRoutes from "./routes/user.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

function isAllowedLocalOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (origin === process.env.CLIENT_URL) {
    return true;
  }

  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedLocalOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ems-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;
