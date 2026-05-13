import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Performance from "../models/Performance.js";
import Announcement from "../models/Announcement.js";
import {
  MockUser,
  MockAttendance,
  MockLeaveRequest,
  MockPerformance,
  MockAnnouncement
} from "./mockDb.js";

let useMockDb = false;

export function setMockDbMode(value) {
  useMockDb = value;
}

export function getModels() {
  return {
    User: useMockDb ? MockUser : User,
    Attendance: useMockDb ? MockAttendance : Attendance,
    LeaveRequest: useMockDb ? MockLeaveRequest : LeaveRequest,
    Performance: useMockDb ? MockPerformance : Performance,
    Announcement: useMockDb ? MockAnnouncement : Announcement
  };
}
