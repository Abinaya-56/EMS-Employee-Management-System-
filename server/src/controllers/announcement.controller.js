import { getModels } from "../utils/modelFactory.js";

export async function listAnnouncements(_req, res) {
  try {
    const { Announcement, User } = getModels();
    const [records, users] = await Promise.all([Announcement.find({}), User.find({})]);
    const userById = new Map(users.map((item) => [String(item._id), item]));

    return res.json(
      [...records]
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        .slice(0, 50)
        .map((record) => ({
          ...record,
          createdBy: userById.get(String(record.createdBy)) || record.createdBy
        }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function createAnnouncement(req, res) {
  try {
    const { Announcement, User } = getModels();
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const record = await Announcement.create({
      title,
      message,
      createdBy: req.user.id
    });
    const creator = await User.findById(req.user.id);
    return res.status(201).json({
      ...record,
      createdBy: creator ? { _id: creator._id, name: creator.name } : req.user.id
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
