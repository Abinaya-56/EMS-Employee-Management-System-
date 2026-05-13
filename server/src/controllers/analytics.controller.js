import { getModels } from "../utils/modelFactory.js";

function countByStatus(records, status) {
  return records.filter((item) => (item.status || "pending") === status).length;
}

export async function getEmployeeSummary(req, res) {
  try {
    const { Attendance, LeaveRequest, Performance, User } = getModels();
    const employeeId = req.params.id;
    const employee = await User.findById(employeeId);

    if (!employee || employee.role !== "employee") {
      return res.status(404).json({ message: "Employee not found" });
    }

    const [attendance, leaveRequests, performance] = await Promise.all([
      Attendance.find({ employee: employeeId }),
      LeaveRequest.find({ employee: employeeId }),
      Performance.find({ employee: employeeId })
    ]);

    const presentDays = countByStatus(attendance, "present");
    const absentDays = countByStatus(attendance, "absent");
    const approvedLeaves = countByStatus(leaveRequests, "approved");
    const pendingLeaves = countByStatus(leaveRequests, "pending");
    const averageScore =
      performance.length > 0
        ? Number(
            (performance.reduce((sum, item) => sum + item.score, 0) / performance.length).toFixed(2)
          )
        : 0;

    return res.json({
      employee,
      attendance: {
        totalDays: attendance.length,
        presentDays,
        absentDays
      },
      leaves: {
        total: leaveRequests.length,
        approved: approvedLeaves,
        pending: pendingLeaves
      },
      performance: {
        averageScore,
        timeline: performance.map((item) => ({
          reviewPeriod: item.reviewPeriod,
          score: item.score
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getDepartmentSummary(_req, res) {
  try {
    const { Attendance, LeaveRequest, Performance, User } = getModels();
    const employees = await User.find({ role: "employee" });
    const departmentNames = [...new Set(employees.map((item) => item.department || "General"))];

    const summaries = await Promise.all(
      departmentNames.map(async (department) => {
        const departmentEmployees = employees.filter(
          (item) => (item.department || "General") === department
        );
        const employeeIds = departmentEmployees.map((item) => item._id);

        const [attendance, leaves, performance] = await Promise.all([
          Attendance.find({}),
          LeaveRequest.find({}),
          Performance.find({})
        ]);

        const departmentAttendance = attendance.filter((item) => employeeIds.includes(String(item.employee)));
        const departmentLeaves = leaves.filter((item) => employeeIds.includes(String(item.employee)));
        const departmentPerformance = performance.filter((item) => employeeIds.includes(String(item.employee)));

        const presentDays = countByStatus(departmentAttendance, "present");
        const absentDays = countByStatus(departmentAttendance, "absent");
        const avgPerformance =
          departmentPerformance.length > 0
            ? Number(
                (
                  departmentPerformance.reduce((sum, item) => sum + item.score, 0) /
                  departmentPerformance.length
                ).toFixed(2)
              )
            : 0;

        return {
          department,
          employees: departmentEmployees.length,
          presentDays,
          absentDays,
          leaveRequests: departmentLeaves.length,
          avgPerformance
        };
      })
    );

    return res.json(summaries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
