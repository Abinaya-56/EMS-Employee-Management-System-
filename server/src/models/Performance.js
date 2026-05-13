import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, min: 1, max: 10, required: true },
    goals: [{ type: String }],
    reviewNotes: { type: String },
    reviewPeriod: { type: String, required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
