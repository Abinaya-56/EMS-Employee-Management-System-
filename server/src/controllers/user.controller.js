import { getModels } from "../utils/modelFactory.js";

export async function listEmployees(_req, res) {
  try {
    const { User } = getModels();
    const employees = await User.find({ role: "employee" });

    return res.json(
      [...employees]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((employee) => ({
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          isManager: employee.isManager || false,
          role: employee.role
        }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
