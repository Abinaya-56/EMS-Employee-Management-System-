import { getModels } from "../utils/modelFactory.js";

export async function markAttendance(req, res) {
  try {
    const { Attendance } = getModels();
    const status = req.body.status === "absent" ? "absent" : "present";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { employee: req.user.id, date: today },
      {
        employee: req.user.id,
        date: today,
        status
      },
      { new: true, upsert: true }
    );

    return res.status(201).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getAttendance(req, res) {
  try {
    const { Attendance, User } = getModels();
    const filters = req.user.role === "admin" ? {} : { employee: req.user.id };
    const [records, users] = await Promise.all([Attendance.find(filters), User.find({})]);
    const userById = new Map(users.map((item) => [String(item._id), item]));

    return res.json(
      [...records]
        .sort((left, right) => new Date(right.date) - new Date(left.date))
        .map((record) => ({
          ...record,
          employee: userById.get(String(record.employee)) || record.employee
        }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
