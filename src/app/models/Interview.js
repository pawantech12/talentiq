import mongoose from "mongoose";

const InterviewQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    category: { type: String, default: "Technical" },
    question: { type: String, required: true, maxlength: 1200 },
    tip: { type: String, default: "", maxlength: 500 },
    skill: { type: String, default: "General", maxlength: 80 },
  },
  { _id: false },
);

const InterviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    questions: { type: [InterviewQuestionSchema], required: true },
    answers: { type: Map, of: String, default: {} },
    durationSeconds: { type: Number, default: 600 },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
      index: true,
    },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, versionKey: false },
);

InterviewSchema.index({ student: 1, job: 1 }, { unique: true });

export default mongoose.models.Interview ||
  mongoose.model("Interview", InterviewSchema);
