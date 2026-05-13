import { getModels } from "../utils/modelFactory.js";

export async function createPerformanceReview(req, res) {
  try {
    const { Performance } = getModels();
    const review = await Performance.create({
      employee: req.body.employee,
      score: req.body.score,
      goals: req.body.goals || [],
      reviewNotes: req.body.reviewNotes,
      reviewPeriod: req.body.reviewPeriod,
      reviewedBy: req.user.id
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function listPerformanceReviews(req, res) {
  try {
    const { Performance, User } = getModels();
    const filters = req.user.role === "admin" ? {} : { employee: req.user.id };
    const [reviews, users] = await Promise.all([Performance.find(filters), User.find({})]);
    const userById = new Map(users.map((item) => [String(item._id), item]));

    return res.json(
      reviews.map((review) => ({
        ...review,
        employee: userById.get(String(review.employee)) || review.employee,
        reviewedBy: userById.get(String(review.reviewedBy)) || review.reviewedBy
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
