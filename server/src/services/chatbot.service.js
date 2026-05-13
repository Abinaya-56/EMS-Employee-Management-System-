import { getModels } from "../utils/modelFactory.js";

export async function answerEmployeeQuery(question, userId) {
  const { User, LeaveRequest, Attendance } = getModels();
  const [user, leaveCount, attendanceCount] = await Promise.all([
    User.findById(userId),
    LeaveRequest.find({ employee: userId }),
    Attendance.find({ employee: userId })
  ]);

  if (!user) {
    return "I could not find your profile in the HR system.";
  }

  const normalized = (question || "").toLowerCase();

  if (normalized.includes("leave")) {
    return `${user.name}, you have ${leaveCount.length} leave requests recorded in the system.`;
  }

  if (normalized.includes("attendance")) {
    return `${user.name}, there are ${attendanceCount.length} attendance records linked to your account.`;
  }

  return `Hi ${user.name}. I can help with attendance, leave requests, and performance-related questions based on your EMS data.`;
}
