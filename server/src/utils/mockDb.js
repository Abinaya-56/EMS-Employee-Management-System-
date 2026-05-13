import bcrypt from "bcryptjs";

// In-memory data storage for development
const mockData = {
  users: [],
  attendance: [],
  leaveRequests: [],
  performance: [],
  announcements: []
};

// Initialize with sample users
export async function initMockDb() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const employeePassword = await bcrypt.hash("12345", 10);

  mockData.users = [
    {
      _id: "1",
      name: "HR Admin",
      email: "hr@ems.com",
      password: adminPassword,
      role: "admin",
      department: "HR"
    },
    {
      _id: "2",
      name: "HR Manager",
      email: "hrmanager@ems.com",
      password: adminPassword,
      role: "admin",
      department: "HR"
    },
    {
      _id: "3",
      name: "Abi",
      email: "abi@ems.com",
      password: employeePassword,
      role: "employee",
      department: "Engineering",
      isManager: true
    },
    {
      _id: "4",
      name: "Dashu",
      email: "dashu@ems.com",
      password: employeePassword,
      role: "employee",
      department: "Engineering",
      isManager: true
    },
    {
      _id: "5",
      name: "Auranya",
      email: "auranya@ems.com",
      password: employeePassword,
      role: "employee",
      department: "Finance",
      isManager: true
    },
    {
      _id: "6",
      name: "Adhiran",
      email: "adhiran@ems.com",
      password: employeePassword,
      role: "employee",
      department: "Engineering"
    },
    {
      _id: "7",
      name: "Priya",
      email: "priya@ems.com",
      password: employeePassword,
      role: "employee",
      department: "HR",
      isManager: true
    },
    {
      _id: "8",
      name: "Vikram",
      email: "vikram@ems.com",
      password: employeePassword,
      role: "employee",
      department: "Operations",
      isManager: true
    },
    {
      _id: "10",
      name: "Arjun",
      email: "arjun@ems.com",
      password: employeePassword,
      role: "employee",
      department: "Engineering"
    },
    {
      _id: "11",
      name: "Sneha",
      email: "sneha@ems.com",
      password: employeePassword,
      role: "employee",
      department: "Marketing",
      isManager: true
    },
    {
      _id: "12",
      name: "Rohan",
      email: "rohan@ems.com",
      password: employeePassword,
      role: "employee",
      department: "Finance"
    }
  ];

  mockData.performance = [
    {
      _id: "p1",
      employee: "3",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 9,
      goals: ["Delivery", "Team support"],
      reviewNotes: "Strong technical ownership and reliable delivery."
    },
    {
      _id: "p2",
      employee: "3",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 8,
      goals: ["Code quality", "Mentoring"],
      reviewNotes: "Continues to set a strong example for the team."
    },
    {
      _id: "p3",
      employee: "4",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 8,
      goals: ["Coordination", "Planning"],
      reviewNotes: "Good execution on priority tasks and coordination."
    },
    {
      _id: "p4",
      employee: "4",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 9,
      goals: ["Leadership", "Mentoring"],
      reviewNotes: "Shows strong ownership and helps the team move faster."
    },
    {
      _id: "p5",
      employee: "5",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 9,
      goals: ["Reporting", "Accuracy"],
      reviewNotes: "Excellent accuracy and timely reporting."
    },
    {
      _id: "p6",
      employee: "5",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 8,
      goals: ["Analysis", "Forecasting"],
      reviewNotes: "Maintains strong visibility on finance operations."
    },
    {
      _id: "p7",
      employee: "6",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 7,
      goals: ["Feature work", "Debugging"],
      reviewNotes: "Steady contributor with room to improve delivery speed."
    },
    {
      _id: "p8",
      employee: "6",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 8,
      goals: ["Testing", "Ownership"],
      reviewNotes: "Improved consistency and quality this quarter."
    },
    {
      _id: "p9",
      employee: "7",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 9,
      goals: ["Policy support", "Coordination"],
      reviewNotes: "Dependable HR partner with strong communication."
    },
    {
      _id: "p10",
      employee: "7",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 9,
      goals: ["Process improvement", "Employee support"],
      reviewNotes: "Consistently supports HR operations with care."
    },
    {
      _id: "p11",
      employee: "8",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 8,
      goals: ["Scheduling", "Response time"],
      reviewNotes: "Reliable operations support and quick response."
    },
    {
      _id: "p12",
      employee: "8",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 9,
      goals: ["Coordination", "Process follow-up"],
      reviewNotes: "Keeps operations running smoothly and efficiently."
    },
    {
      _id: "p13",
      employee: "10",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 7,
      goals: ["Bug fixing", "Documentation"],
      reviewNotes: "Solid contributor who is improving steadily."
    },
    {
      _id: "p14",
      employee: "10",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 8,
      goals: ["Testing", "Delivery"],
      reviewNotes: "Better delivery rhythm and improved code quality."
    },
    {
      _id: "p15",
      employee: "11",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 8,
      goals: ["Campaign support", "Communication"],
      reviewNotes: "Strong support for ongoing marketing activity."
    },
    {
      _id: "p16",
      employee: "11",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 9,
      goals: ["Brand work", "Coordination"],
      reviewNotes: "Takes initiative and keeps work organized."
    },
    {
      _id: "p17",
      employee: "12",
      reviewedBy: "2",
      reviewPeriod: "Q4 2025",
      score: 7,
      goals: ["Accuracy", "Reporting"],
      reviewNotes: "Consistent and dependable finance support."
    },
    {
      _id: "p18",
      employee: "12",
      reviewedBy: "2",
      reviewPeriod: "Q1 2026",
      score: 8,
      goals: ["Analysis", "Timeliness"],
      reviewNotes: "Improved turnaround time and reporting clarity."
    }
  ];

  console.log("✓ Mock database initialized with sample users");
}

// Mock User model
export const MockUser = {
  countDocuments: async () => mockData.users.length,
  insertMany: async (users) => {
    mockData.users.push(
      ...users.map((u, i) => ({ ...u, _id: String(mockData.users.length + i) }))
    );
  },
  create: async (data) => {
    const newUser = { ...data, _id: String(Date.now()) };
    mockData.users.push(newUser);
    return newUser;
  },
  findOne: async (query) => {
    return mockData.users.find((u) => {
      if (query.email) return u.email === query.email;
      if (query._id) return u._id === query._id;
      return false;
    });
  },
  find: async (query = {}) => {
    if (Object.keys(query).length === 0) return [...mockData.users];
    return mockData.users.filter((u) => {
      if (query.role) return u.role === query.role;
      return true;
    });
  },
  findById: async (id) => {
    return mockData.users.find((u) => u._id === id);
  }
};

// Mock Attendance model
export const MockAttendance = {
  insertMany: async (records) => {
    mockData.attendance.push(
      ...records.map((r, i) => ({ ...r, _id: String(Date.now() + i) }))
    );
  },
  findOneAndUpdate: async (query, update, options) => {
    let found = mockData.attendance.find((a) => {
      if (query.employee && query.date) {
        const queryDate = new Date(query.date).toDateString();
        const recordDate = new Date(a.date || 0).toDateString();
        return a.employee === query.employee && queryDate === recordDate;
      }
      return false;
    });

    if (!found && options?.upsert) {
      found = {
        _id: String(Date.now()),
        employee: query.employee,
        date: query.date,
        status: update.$set?.status || "present"
      };
      mockData.attendance.push(found);
    } else if (found && update.$set) {
      Object.assign(found, update.$set);
    }
    return found;
  },
  find: async (query = {}) => {
    return mockData.attendance
      .filter((a) => {
        if (query.employee) return a.employee === query.employee;
        return true;
      })
      .map((a) => ({ ...a, employee: { _id: a.employee } }));
  }
};

// Mock LeaveRequest model
export const MockLeaveRequest = {
  insertMany: async (records) => {
    mockData.leaveRequests.push(
      ...records.map((r, i) => ({ ...r, _id: String(Date.now() + i) }))
    );
  },
  create: async (data) => {
    const newRequest = { ...data, status: data.status || "pending", _id: String(Date.now()) };
    mockData.leaveRequests.push(newRequest);
    return newRequest;
  },
  find: async (query = {}) => {
    return mockData.leaveRequests.filter((l) => {
      if (query.employee) return l.employee === query.employee;
      if (query.status) return l.status === query.status;
      return true;
    });
  },
  findByIdAndUpdate: async (id, update) => {
    const found = mockData.leaveRequests.find((l) => l._id === id);
    if (found && update.$set) {
      Object.assign(found, update.$set);
    }
    return found;
  }
};

// Mock Performance model
export const MockPerformance = {
  insertMany: async (records) => {
    mockData.performance.push(
      ...records.map((r, i) => ({ ...r, _id: String(Date.now() + i) }))
    );
  },
  find: async (query = {}) => {
    return mockData.performance
      .filter((p) => {
        if (query.employee) return p.employee === query.employee;
        return true;
      })
      .map((p) => ({
        ...p,
        employee: mockData.users.find((u) => u._id === p.employee),
        reviewedBy: mockData.users.find((u) => u._id === p.reviewedBy)
      }));
  }
};

// Mock Announcement model
export const MockAnnouncement = {
  insertMany: async (records) => {
    mockData.announcements.push(
      ...records.map((r, i) => ({
        ...r,
        _id: String(Date.now() + i),
        createdAt: new Date()
      }))
    );
  },
  create: async (data) => {
    const record = {
      ...data,
      _id: String(Date.now()),
      createdAt: new Date()
    };
    mockData.announcements.push(record);
    return record;
  },
  find: async () => {
    return mockData.announcements
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50)
      .map((a) => ({
        ...a,
        createdBy: mockData.users.find((u) => u._id === a.createdBy)
      }));
  }
};

export { mockData };
