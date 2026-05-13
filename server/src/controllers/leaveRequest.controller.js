import { getModels } from "../utils/modelFactory.js";

export async function createLeaveRequest(req, res) {
  try {
    const { LeaveRequest } = getModels();
    const request = await LeaveRequest.create({
      employee: req.user.id,
      title: req.body.title,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      reason: req.body.reason
    });

    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function listLeaveRequests(req, res) {
  try {
    const { LeaveRequest, User } = getModels();
    const filters = req.user.role === "admin" ? {} : { employee: req.user.id };
    const [requests, users] = await Promise.all([LeaveRequest.find(filters), User.find({})]);
    const userById = new Map(users.map((item) => [String(item._id), item]));

    return res.json(
      requests.map((request) => ({
        ...request,
        status: request.status || "pending",
        title: request.title || "Leave Request",
        employee: userById.get(String(request.employee)) || request.employee
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function reviewLeaveRequest(req, res) {
  try {
    const { LeaveRequest } = getModels();
    const nextStatus = req.body.status === "rejected" ? "denied" : req.body.status;
    const updated = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: nextStatus,
          reviewedBy: req.user.id
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
