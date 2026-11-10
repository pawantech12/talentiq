import mongoose from "mongoose";

const AssessmentQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: (value) => value.length === 4,
    },
    skill: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    correctAnswer: { type: Number, required: true, select: false },
    explanation: { type: String, default: "", select: false },
  },
  { _id: false },
);

const AssessmentSchema = new mongoose.Schema(
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
    questions: {
      type: [AssessmentQuestionSchema],
      required: true,
    },
    answers: {
      type: Map,
      of: Number,
      default: {},
    },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    durationSeconds: { type: Number, default: 900 },
    submittedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
      index: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

AssessmentSchema.index({ student: 1, job: 1 }, { unique: true });

export default mongoose.models.Assessment ||
  mongoose.model("Assessment", AssessmentSchema);
