import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { MockUser } from "./mockDb.js";

let useMockDb = false;

export function setMockDbMode(value) {
  useMockDb = value;
}

export async function seedDefaultUsers() {
  const userModel = useMockDb ? MockUser : User;
  
  const totalUsers = await userModel.countDocuments();
  if (totalUsers > 0) {
    return;
  }

  const [adminPassword, employeePassword] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("12345", 10)
  ]);

  const employees = [
    { name: "Abi", department: "Engineering" },
    { name: "Dashu", department: "Marketing" },
    { name: "Auranya", department: "Finance" },
    { name: "Adhiran", department: "Engineering" },
    { name: "Priya", department: "HR" },
    { name: "Vikram", department: "Operations" },
    { name: "Neha", department: "Sales" },
    { name: "Arjun", department: "Engineering" },
    { name: "Sneha", department: "Marketing" },
    { name: "Rohan", department: "Finance" }
  ];

  const usersToInsert = [
    {
      name: "HR Admin",
      email: "hr@ems.com",
      password: adminPassword,
      role: "admin",
      department: "HR"
    },
    {
      name: "HR Manager",
      email: "hrmanager@ems.com",
      password: adminPassword,
      role: "admin",
      department: "HR"
    },
    ...employees.map((emp, index) => ({
      name: emp.name,
      email: `${emp.name.toLowerCase()}@ems.com`,
      password: employeePassword,
      role: "employee",
      department: emp.department
    }))
  ];

  await userModel.insertMany(usersToInsert);

  console.log("Sample users created:");
  console.log("HR Admins: hr@ems.com (password: admin123), hrmanager@ems.com (password: admin123)");
  employees.forEach((emp) => {
    console.log(`Employee: ${emp.name.toLowerCase()}@ems.com (password: 12345)`);
  });
}
