import mongoose from "mongoose";
import {
  MockUser,
  MockAttendance,
  MockLeaveRequest,
  MockPerformance,
  MockAnnouncement
} from "../utils/mockDb.js";

let usesMock = false;

export function setUsesMock(value) {
  usesMock = value;
}

export function getUsesMock() {
  return usesMock;
}

// Wrapper for User model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee"
    },
    department: { type: String }
  },
  { timestamps: true }
);

const MongoUser = mongoose.model("User", userSchema);

export const User = new Proxy(MongoUser, {
  get: (target, prop) => {
    return usesMock ? MockUser[prop] : target[prop];
  }
});

// Wrapper for Attendance model
const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: () => new Date().toDateString() },
    status: { type: String, enum: ["present", "absent", "leave"], default: "present" },
    checkInTime: String,
    checkOutTime: String
  },
  { timestamps: true }
);

const MongoAttendance = mongoose.model("Attendance", attendanceSchema);

export const Attendance = new Proxy(MongoAttendance, {
  get: (target, prop) => {
    return usesMock ? MockAttendance[prop] : target[prop];
  }
});

// Wrapper for LeaveRequest model
const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startDate: Date,
    endDate: Date,
    reason: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const MongoLeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

export const LeaveRequest = new Proxy(MongoLeaveRequest, {
  get: (target, prop) => {
    return usesMock ? MockLeaveRequest[prop] : target[prop];
  }
});

// Wrapper for Performance model
const performanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: { type: Number, min: 1, max: 10 },
    goals: [String],
    reviewNotes: String,
    reviewPeriod: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const MongoPerformance = mongoose.model("Performance", performanceSchema);

export const Performance = new Proxy(MongoPerformance, {
  get: (target, prop) => {
    return usesMock ? MockPerformance[prop] : target[prop];
  }
});

// Wrapper for Announcement model
const announcementSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const MongoAnnouncement = mongoose.model("Announcement", announcementSchema);

export const Announcement = new Proxy(MongoAnnouncement, {
  get: (target, prop) => {
    return usesMock ? MockAnnouncement[prop] : target[prop];
  }
});
