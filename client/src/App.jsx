import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "./api";

function downloadCSV(data, filename) {
  if (!data || !data.length) {
    alert("No data to export");
    return;
  }

  const keys = Object.keys(data[0]).filter(
    (key) => typeof data[0][key] !== "object" || data[0][key] === null
  );
  const csv = [
    keys.join(","),
    ...data.map((row) =>
      keys
        .map((key) => {
          const val = row[key];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") return "";
          const str = String(val).replace(/"/g, '""');
          return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
        })
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("ems_token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me", { token });
        setUser(data.user);
      } catch (_error) {
        localStorage.removeItem("ems_token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  const onLoginSuccess = (authData) => {
    localStorage.setItem("ems_token", authData.token);
    setToken(authData.token);
    setUser(authData.user);
    setError("");
  };

  const onLogout = () => {
    localStorage.removeItem("ems_token");
    setToken("");
    setUser(null);
  };

  if (loading) {
    return <div className="screen-center">Loading...</div>;
  }

  if (!user) {
    return <LoginView onLoginSuccess={onLoginSuccess} error={error} setError={setError} />;
  }

  return (
    <div className="portal-shell">
      <header className="topbar">
        <div>
          <h1>EMS Portal</h1>
          <p>
            Logged in as {user.name} ({user.role === "admin" ? "HR Admin" : "Staff"})
          </p>
        </div>
        <button className="btn btn-light" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="portal-main">
        {user.role === "admin" ? (
          <AdminPortal token={token} user={user} />
        ) : (
          <StaffPortal token={token} user={user} />
        )}
      </main>
    </div>
  );
}

function LoginView({ onLoginSuccess, error, setError }) {
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "employee", department: "" });
  const [busy, setBusy] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email: form.email, password: form.password }
      });
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitRegister(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: form
      });
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen-center">
      <section className="card login-card">
        <h2>{isRegister ? "Create Account" : "Staff / HR Login"}</h2>
        <p className="hint">{isRegister ? "Register a new account" : "Use your registered account to continue."}</p>
        <form onSubmit={isRegister ? submitRegister : submitLogin} className="form-grid">
          {isRegister ? (
            <>
              <label>
                Full Name
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label>
                Department
                <input
                  type="text"
                  value={form.department}
                  onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
                  placeholder="Optional"
                />
              </label>
            </>
          ) : null}
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          {isRegister ? (
            <label>
              Role
              <select
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              >
                <option value="employee">Staff</option>
                <option value="admin">HR Admin</option>
              </select>
            </label>
          ) : null}
          <button disabled={busy} className="btn" type="submit">
            {busy ? (isRegister ? "Creating..." : "Signing in...") : isRegister ? "Register" : "Login"}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
        <p className="center-text" style={{ marginTop: "0.5rem" }}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button
            className="link-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setForm({ email: "", password: "", name: "", role: "employee", department: "" });
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </section>
    </div>
  );
}

function StaffPortal({ token, user }) {
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [leaveForm, setLeaveForm] = useState({ title: "", startDate: "", endDate: "", reason: "" });
  const [message, setMessage] = useState("");

  const presentDays = useMemo(
    () => attendance.filter((item) => item.status === "present").length,
    [attendance]
  );
  const absentDays = useMemo(
    () => attendance.filter((item) => item.status === "absent").length,
    [attendance]
  );
  const approvedLeaves = useMemo(
    () => leaveRequests.filter((item) => item.status === "approved").length,
    [leaveRequests]
  );
  const pendingLeaves = useMemo(
    () => leaveRequests.filter((item) => item.status === "pending").length,
    [leaveRequests]
  );

  async function loadData() {
    const [attendanceData, leaveData, announcementData] = await Promise.all([
      apiRequest("/attendance", { token }),
      apiRequest("/leave-requests", { token }),
      apiRequest("/announcements", { token })
    ]);
    setAttendance(attendanceData);
    setLeaveRequests(leaveData);
    setAnnouncements(announcementData);
  }

  useEffect(() => {
    loadData().catch((error) => setMessage(error.message));
  }, []);

  async function submitAttendance(event) {
    event.preventDefault();
    setMessage("");

    try {
      await apiRequest("/attendance/mark", {
        method: "POST",
        token,
        body: { status: attendanceStatus }
      });
      await loadData();
      setMessage("Attendance updated for today.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitLeave(event) {
    event.preventDefault();
    setMessage("");

    try {
      await apiRequest("/leave-requests", {
        method: "POST",
        token,
        body: leaveForm
      });
      setLeaveForm({ title: "", startDate: "", endDate: "", reason: "" });
      await loadData();
      setMessage("Leave request submitted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="grid two-cols staff-grid">
      <section className="card full-width dashboard-header">
        <div>
          <h3>Welcome, {user.name}</h3>
          <p className="hint">Department: {user.department || "General"}</p>
        </div>
        <div className="stat-row">
          <div className="stat-chip">Present: {presentDays}</div>
          <div className="stat-chip">Absent: {absentDays}</div>
          <div className="stat-chip">Approved Leaves: {approvedLeaves}</div>
          <div className="stat-chip">Pending Leaves: {pendingLeaves}</div>
        </div>
        {message ? <p className="success-text">{message}</p> : null}
      </section>

      <div className="staff-column">
        <section className="card compact-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3>Mark Attendance</h3>
            <button className="btn btn-small" onClick={() => downloadCSV(attendance, "attendance")}>Export CSV</button>
          </div>
          <form onSubmit={submitAttendance} className="form-grid inline-form">
            <label>
              Status
              <select
                value={attendanceStatus}
                onChange={(event) => setAttendanceStatus(event.target.value)}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </label>
            <button className="btn" type="submit">
              Save
            </button>
          </form>
        </section>

        <section className="card apply-leave-card">
          <h3>Apply Leave</h3>
          <form onSubmit={submitLeave} className="form-grid">
            <label>
              Title
              <input
                type="text"
                required
                value={leaveForm.title}
                onChange={(event) => setLeaveForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label>
              Start Date
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(event) =>
                  setLeaveForm((prev) => ({ ...prev, startDate: event.target.value }))
                }
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(event) => setLeaveForm((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </label>
            <label>
              Reason
              <textarea
                required
                rows={3}
                value={leaveForm.reason}
                onChange={(event) => setLeaveForm((prev) => ({ ...prev, reason: event.target.value }))}
              />
            </label>
            <button className="btn" type="submit">
              Submit Leave Request
            </button>
          </form>
        </section>
      </div>

      <div className="staff-column">
        <section className="card">
          <h3>Recent Activity</h3>
          {attendance.length === 0 && leaveRequests.length === 0 && announcements.length === 0 ? (
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <div className="leave-tray-item">
                <strong>No recent activity</strong>
                <p className="hint">Once you mark attendance, apply for leave, or HR posts announcements, they'll appear here.</p>
              </div>
              <div className="leave-tray-item">
                <strong>Tip</strong>
                <p className="hint">Try marking attendance for today or submit a sample leave to see how items appear.</p>
              </div>
            </div>
          ) : (
            <div className="announcement-list">
              {attendance.slice(0,4).map((a, idx) => (
                <article key={`att-${idx}`} className="announcement-item">
                  <strong>Attendance</strong>
                  <p className="hint">{new Date(a.date || a._id || Date.now()).toLocaleDateString()} — {a.status}</p>
                </article>
              ))}

              {leaveRequests.slice(0,3).map((l) => (
                <article key={l._id} className="announcement-item">
                  <strong>Leave: {l.title || "Request"}</strong>
                  <p className="hint">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</p>
                  <small className="hint">{l.reason}</small>
                </article>
              ))}

              {announcements.slice(0,3).map((n) => (
                <article key={n._id} className="announcement-item">
                  <strong>Announcement: {n.title}</strong>
                  <p className="hint">{n.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h3>Leave Status</h3>
          <SimpleTable
            columns={["Title", "Start", "End", "Status", "Reason"]}
            rows={leaveRequests.map((item) => [
              item.title || "Leave Request",
              new Date(item.startDate).toLocaleDateString(),
              new Date(item.endDate).toLocaleDateString(),
              <span className={`status-label ${item.status === "approved" ? "status-approved" : item.status === "rejected" || item.status === "denied" ? "status-denied" : "status-pending"}`}>
                {item.status === "rejected" ? "denied" : item.status}
              </span>,
              <span className="leave-description" title={item.reason}>{item.reason}</span>
            ])}
          />
        </section>
      </div>

      <section className="card full-width">
        <h3>HR Announcements</h3>
        {announcements.length === 0 ? (
          <p className="hint">No announcements yet.</p>
        ) : (
          <div className="announcement-list">
            {announcements.map((item) => (
              <article key={item._id} className="announcement-item">
                <h4>{item.title}</h4>
                <p>{item.message}</p>
                <small>
                  By {item.createdBy?.name || "HR"} on {new Date(item.createdAt).toLocaleString()}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AdminPortal({ token }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [departmentSummary, setDepartmentSummary] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "" });
  const [performanceForm, setPerformanceForm] = useState({
    score: "",
    reviewPeriod: "",
    reviewNotes: "",
    goals: ""
  });
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [info, setInfo] = useState("");
  const [postedAnnouncementTitle, setPostedAnnouncementTitle] = useState("");
  const [showLeaveTray, setShowLeaveTray] = useState(false);

  async function bootstrap() {
    const [employeeData, departmentData, leaveData, announcementData] = await Promise.all([
      apiRequest("/users/employees", { token }),
      apiRequest("/analytics/departments", { token }),
      apiRequest("/leave-requests", { token }),
      apiRequest("/announcements", { token })
    ]);

    setEmployees(employeeData);
    setDepartmentSummary(departmentData);
    setLeaveRequests(leaveData);
    setAnnouncements(announcementData);

    if (employeeData.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employeeData[0]._id);
    }

    if (departmentData.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departmentData[0].department);
    }
  }

  useEffect(() => {
    bootstrap().catch((error) => setInfo(error.message));
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) return;

    apiRequest(`/analytics/employee/${selectedEmployeeId}`, { token })
      .then(setEmployeeSummary)
      .catch((error) => setInfo(error.message));
  }, [selectedEmployeeId]);

  const pendingLeaveRequests = useMemo(
    () => leaveRequests.filter((item) => item.status === "pending"),
    [leaveRequests]
  );

  const selectedDepartmentSummary = useMemo(
    () =>
      departmentSummary.find((item) => item.department === selectedDepartment) ||
      departmentSummary[0] ||
      null,
    [departmentSummary, selectedDepartment]
  );

  const departmentEmployees = useMemo(
    () =>
      employees.filter((employee) => !selectedDepartment || employee.department === selectedDepartment),
    [employees, selectedDepartment]
  );

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee._id === selectedEmployeeId) || departmentEmployees[0] || null,
    [employees, departmentEmployees, selectedEmployeeId]
  );

  const handleDepartmentSelect = (departmentName) => {
    setSelectedDepartment(departmentName);
    const nextEmployee = employees.find((employee) => employee.department === departmentName);
    if (nextEmployee) {
      setSelectedEmployeeId(nextEmployee._id);
    }
  };

  async function submitAnnouncement(event) {
    event.preventDefault();

    try {
      await apiRequest("/announcements", {
        method: "POST",
        token,
        body: announcementForm
      });
      setPostedAnnouncementTitle(announcementForm.title);
      setAnnouncementForm({ title: "", message: "" });
      await bootstrap();
      setInfo("Announcement sent.");
    } catch (error) {
      setInfo(error.message);
    }
  }

  async function submitPerformance(event) {
    event.preventDefault();

    if (!selectedEmployeeId) return;

    try {
      await apiRequest("/performance", {
        method: "POST",
        token,
        body: {
          employee: selectedEmployeeId,
          score: Number(performanceForm.score),
          reviewPeriod: performanceForm.reviewPeriod,
          reviewNotes: performanceForm.reviewNotes,
          goals: performanceForm.goals
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        }
      });

      setPerformanceForm({ score: "", reviewPeriod: "", reviewNotes: "", goals: "" });
      const summary = await apiRequest(`/analytics/employee/${selectedEmployeeId}`, { token });
      setEmployeeSummary(summary);
      await bootstrap();
      setInfo("Performance review saved.");
    } catch (error) {
      setInfo(error.message);
    }
  }

  async function updateLeaveStatus(id, status) {
    try {
      await apiRequest(`/leave-requests/${id}/review`, {
        method: "PATCH",
        token,
        body: { status }
      });
      await bootstrap();
      setInfo(`Leave request ${status}.`);
    } catch (error) {
      setInfo(error.message);
    }
  }

  async function askChatbot(event) {
    event.preventDefault();

    try {
      const response = await apiRequest("/chatbot/query", {
        method: "POST",
        token,
        body: { question: chatQuestion }
      });
      setChatAnswer(response.answer);
    } catch (error) {
      setChatAnswer(error.message);
    }
  }

  const perfTimeline = employeeSummary?.performance?.timeline || [];
  const totalEmployees = employees.length;
  const totalDepartments = useMemo(
    () => new Set(departmentSummary.map((item) => item.department)).size,
    [departmentSummary]
  );
  const departmentAttendanceRate = selectedDepartmentSummary
    ? Math.round(
        (selectedDepartmentSummary.presentDays /
          Math.max(1, selectedDepartmentSummary.presentDays + selectedDepartmentSummary.absentDays)) *
          100
      )
    : 0;

  return (
    <div className="admin-layout">
      <section className="card full-width dashboard-header admin-dashboard-header">
        <div className="dashboard-header-top">
          <div>
            <h3>HR Control Panel</h3>
            <p className="hint">Manage departments, employee details, leave approvals, and analytics.</p>
          </div>
          <div className="dashboard-actions">
            <button
              type="button"
              className="icon-btn bell-btn"
              onClick={() => setShowLeaveTray((prev) => !prev)}
              aria-label="Pending leave requests"
            >
              <span aria-hidden="true">🔔</span>
              {pendingLeaveRequests.length > 0 ? <span className="bell-badge">{pendingLeaveRequests.length}</span> : null}
            </button>
            {showLeaveTray ? (
              <div className="leave-tray">
                <h4>Leave Requests</h4>
                {pendingLeaveRequests.length === 0 ? (
                  <p className="hint">No pending leave requests.</p>
                ) : (
                  <div className="leave-tray-list">
                    {pendingLeaveRequests.map((item) => (
                      <article key={item._id} className="leave-tray-item">
                        <strong>{item.employee?.name || "Staff"}</strong>
                        <small>
                          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </small>
                        <div className="action-row">
                          <button className="btn btn-small" onClick={() => updateLeaveStatus(item._id, "approved")}>
                            Leave approved
                          </button>
                          <button className="btn btn-small btn-danger" onClick={() => updateLeaveStatus(item._id, "denied")}> 
                            Leave cancelled
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="stat-row">
          <div className="stat-chip">Total Staff: {totalEmployees}</div>
          <div className="stat-chip">Departments: {totalDepartments}</div>
          <div className="stat-chip" style={{ background: "#fee2e2", color: "#b91c1c" }}>
            Pending Leaves: {pendingLeaveRequests.length}
          </div>
        </div>
        {info ? <p className="success-text">{info}</p> : null}
      </section>

      <section className="admin-grid">
        <div className="admin-left-column">
          <section className="card">
            <h3>Departments</h3>
            <div className="department-list">
              {departmentSummary.map((d) => (
                <button
                  key={d.department}
                  type="button"
                  className={`department-pill ${selectedDepartment === d.department ? "is-active" : ""}`}
                  onClick={() => handleDepartmentSelect(d.department)}
                >
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <strong style={{ display: "block" }}>{d.department}</strong>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <section className="card">
            <h3>Department Progress</h3>
            {selectedDepartmentSummary ? (
              <DepartmentProgressChart
                departmentName={selectedDepartmentSummary.department}
                performance={selectedDepartmentSummary.avgPerformance}
                attendanceRate={departmentAttendanceRate}
                leaveLoad={selectedDepartmentSummary.leaveRequests}
              />
            ) : (
              <p className="hint">Select a department to view its progress graph.</p>
            )}
          </section>

          <section className="card">
            <div className="card-head-row">
              <h3>Employees</h3>
              <button className="btn btn-small" onClick={() => downloadCSV(departmentEmployees, "employees")}>Export CSV</button>
            </div>
            <div className="employee-list">
              {departmentEmployees.length === 0 ? (
                <p className="hint">No employees found in this department.</p>
              ) : (
                departmentEmployees.slice(0, 4).map((employee) => (
                  <button
                    key={employee._id}
                    type="button"
                    className={`employee-pill ${selectedEmployeeId === employee._id ? "is-active" : ""} ${employee.isManager ? "is-manager" : ""}`}
                    onClick={() => setSelectedEmployeeId(employee._id)}
                  >
                    <span>{employee.name} {employee.isManager ? "👔" : ""}</span>
                    <small>{employee.department || "General"}</small>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="card">
            <h3>Employee Details</h3>
            {selectedEmployee && employeeSummary ? (
              <>
                <div className="employee-details-layout">
                  <div>
                    <strong>{selectedEmployee.name}</strong>
                    <p className="hint">{selectedEmployee.email}</p>
                  </div>
                  <div className="employee-group">
                    <span className="employee-group-label">Profile</span>
                    <div className="stat-row employee-meta-row">
                      <div className="stat-chip">Department: {selectedEmployee.department || "General"}</div>
                      <div className="stat-chip">Role: {selectedEmployee.role}</div>
                      {selectedEmployee.isManager && <div className="stat-chip" style={{ backgroundColor: "#f59e0b", color: "white" }}>👔 Manager</div>}
                    </div>
                  </div>
                </div>

                <div className="employee-group">
                  <span className="employee-group-label">Work Summary</span>
                  <div className="stat-row employee-metrics-row">
                    <div className="stat-chip">Present: {employeeSummary.attendance.presentDays}</div>
                    <div className="stat-chip">Absent: {employeeSummary.attendance.absentDays}</div>
                    <div className="stat-chip">Leaves: {employeeSummary.leaves.total}</div>
                    <div className="stat-chip">Approved: {employeeSummary.leaves.approved}</div>
                    <div className="stat-chip">Pending: {employeeSummary.leaves.pending}</div>
                    <div className="stat-chip">Avg Score: {employeeSummary.performance.averageScore}/10</div>
                  </div>
                </div>

                <div className="employee-group">
                  <span className="employee-group-label">Performance Timeline</span>
                  <div className="bar-stack">
                    {perfTimeline.length === 0 ? (
                      <p className="hint">No performance records yet.</p>
                    ) : (
                      perfTimeline.map((item, index) => (
                        <MetricBar
                          key={`${item.reviewPeriod}-${index}`}
                          label={item.reviewPeriod}
                          value={item.score}
                          max={10}
                        />
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="hint">Choose an employee to see performance, leave, and attendance details.</p>
            )}
          </section>
        </div>

        <div className="admin-right-column">
          <section className="card">
            <h3>AI Chatbot (HR)</h3>
            <form onSubmit={askChatbot} className="form-grid">
              <label>
                Ask Question
                <input
                  value={chatQuestion}
                  onChange={(event) => setChatQuestion(event.target.value)}
                  placeholder="Example: show attendance summary"
                  required
                />
              </label>
              <button className="btn" type="submit">
                Ask
              </button>
            </form>
            {chatAnswer ? <p className="chat-answer">{chatAnswer}</p> : null}
          </section>

          <section className="card">
            <h3>Post Common Message</h3>
            <form onSubmit={submitAnnouncement} className="form-grid">
              <label>
                Title
                <input
                  required
                  value={announcementForm.title}
                  onChange={(event) =>
                    setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Message
                <textarea
                  required
                  rows={3}
                  value={announcementForm.message}
                  onChange={(event) =>
                    setAnnouncementForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                />
              </label>
              <button className="btn" type="submit">
                Publish
              </button>
            </form>
          </section>

          <section className="card">
            <h3>Add Performance Review</h3>
            <form onSubmit={submitPerformance} className="form-grid">
              <label>
                Review Period
                <input
                  required
                  value={performanceForm.reviewPeriod}
                  onChange={(event) =>
                    setPerformanceForm((prev) => ({ ...prev, reviewPeriod: event.target.value }))
                  }
                  placeholder="Q1 2026"
                />
              </label>
              <label>
                Score (1-10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={performanceForm.score}
                  onChange={(event) =>
                    setPerformanceForm((prev) => ({ ...prev, score: event.target.value }))
                  }
                />
              </label>
              <label>
                Goals (comma separated)
                <input
                  value={performanceForm.goals}
                  onChange={(event) =>
                    setPerformanceForm((prev) => ({ ...prev, goals: event.target.value }))
                  }
                />
              </label>
              <label>
                Notes
                <textarea
                  rows={3}
                  value={performanceForm.reviewNotes}
                  onChange={(event) =>
                    setPerformanceForm((prev) => ({ ...prev, reviewNotes: event.target.value }))
                  }
                />
              </label>
              <button className="btn" type="submit">
                Save Review
              </button>
            </form>
          </section>

          <section className="card full-width">
            <div className="card-head-row">
              <h3>Leave Request Status</h3>
              <button className="btn btn-small" onClick={() => downloadCSV(leaveRequests, "leave-requests")}>Export CSV</button>
            </div>
            <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((item) => {
                    const displayStatus = item.status === "rejected" ? "denied" : item.status;
                    return (
                      <tr key={item._id}>
                        <td>{item.employee?.name || "Staff"}</td>
                        <td>
                          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="leave-description" title={item.reason}>{item.reason || "-"}</span>
                        </td>
                        <td>
                          <span className={`status-label ${displayStatus === "approved" ? "status-approved" : displayStatus === "denied" ? "status-denied" : "status-pending"}`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td>
                          {item.status === "pending" ? (
                            <div className="action-row">
                              <button className="btn btn-small" onClick={() => updateLeaveStatus(item._id, "approved")}>
                                Approve
                              </button>
                              <button
                                className="btn btn-small btn-danger"
                                onClick={() => updateLeaveStatus(item._id, "denied")}
                              >
                                Deny
                              </button>
                            </div>
                          ) : (
                            <span className={`status-label ${displayStatus === "approved" ? "status-approved" : displayStatus === "denied" ? "status-denied" : "status-pending"}`}>{displayStatus}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </section>

          <section className="card full-width">
            <h3>Latest Announcements</h3>
            {postedAnnouncementTitle ? <p className="success-text">Message posted: {postedAnnouncementTitle}</p> : null}
            {announcements.length === 0 ? (
              <p className="hint">No announcements yet.</p>
            ) : (
              <div className="announcement-list">
                {announcements.map((item) => (
                  <article key={item._id} className="announcement-item">
                    <h4>{item.title}</h4>
                    <p>{item.message}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function MetricBar({ label, value, max, meta }) {
  const width = Math.max(6, Math.round((Number(value || 0) / (max || 1)) * 100));

  return (
    <div className="metric-row">
      <div className="metric-head">
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
      <div className="metric-track">
        <div className="metric-fill" style={{ width: `${width}%` }} />
      </div>
      {meta ? <small className="hint">{meta}</small> : null}
    </div>
  );
}

function DepartmentProgressChart({ departmentName, performance, attendanceRate, leaveLoad }) {
  const width = 680;
  const height = 260;
  const padding = { top: 20, right: 22, bottom: 38, left: 46 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const monthlySeries = [
    Math.max(24, Math.min(88, performance * 8 + attendanceRate * 0.18 - leaveLoad * 2)),
    Math.max(24, Math.min(88, performance * 8.2 + attendanceRate * 0.2 - leaveLoad * 1.6)),
    Math.max(24, Math.min(88, performance * 8.4 + attendanceRate * 0.22 - leaveLoad * 1.2)),
    Math.max(24, Math.min(88, performance * 8.6 + attendanceRate * 0.24 - leaveLoad * 0.9)),
    Math.max(24, Math.min(88, performance * 8.8 + attendanceRate * 0.25 - leaveLoad * 0.6)),
    Math.max(24, Math.min(88, performance * 9 + attendanceRate * 0.27 - leaveLoad * 0.3))
  ];

  const yearlySeries = [
    Math.max(30, Math.min(92, performance * 7.8 + attendanceRate * 0.14 + 4)),
    Math.max(30, Math.min(92, performance * 8 + attendanceRate * 0.16 + 5)),
    Math.max(30, Math.min(92, performance * 8.2 + attendanceRate * 0.18 + 6)),
    Math.max(30, Math.min(92, performance * 8.4 + attendanceRate * 0.2 + 7)),
    Math.max(30, Math.min(92, performance * 8.6 + attendanceRate * 0.22 + 8)),
    Math.max(30, Math.min(92, performance * 8.8 + attendanceRate * 0.24 + 9))
  ];

  const labels = ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];

  const maxValue = 100;
  const xForIndex = (index) => padding.left + (chartWidth / (labels.length - 1)) * index;
  const yForValue = (value) => padding.top + (chartHeight - (value / maxValue) * chartHeight);
  const buildPath = (series) =>
    series
      .map((value, index) => `${index === 0 ? "M" : "L"} ${xForIndex(index)} ${yForValue(value)}`)
      .join(" ");

  return (
    <div className="department-chart-card">
      <div className="chart-legend-row">
        <span className="chart-label">Selected department: {departmentName}</span>
        <div className="chart-legend">
          <span className="chart-key monthly">Monthly progress</span>
          <span className="chart-key yearly">Yearly progress</span>
        </div>
      </div>
      <svg className="department-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Department progress chart with monthly and yearly lines">
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} className="chart-axis" />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} className="chart-axis" />

        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={yForValue(tick)}
              x2={width - padding.right}
              y2={yForValue(tick)}
              className="chart-grid"
            />
            <text x={padding.left - 10} y={yForValue(tick) + 4} className="chart-tick-label">
              {tick}
            </text>
          </g>
        ))}

        {labels.map((label, index) => (
          <text key={label} x={xForIndex(index)} y={height - 14} textAnchor="middle" className="chart-tick-label">
            {label}
          </text>
        ))}

        <path d={buildPath(monthlySeries)} className="chart-line monthly-line" />
        <path d={buildPath(yearlySeries)} className="chart-line yearly-line" />

        {monthlySeries.map((value, index) => (
          <circle key={`monthly-${index}`} cx={xForIndex(index)} cy={yForValue(value)} r="4" className="chart-point monthly-point" />
        ))}
        {yearlySeries.map((value, index) => (
          <circle key={`yearly-${index}`} cx={xForIndex(index)} cy={yForValue(value)} r="4" className="chart-point yearly-point" />
        ))}
      </svg>
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  if (!rows.length) {
    return <p className="hint">No records yet.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default App;
