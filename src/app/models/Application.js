import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
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
    resumeName: {
      type: String,
      required: true,
      maxlength: 255,
    },
    resumeText: {
      type: String,
      required: true,
      maxlength: 30000,
      select: false,
    },
    resumeSource: {
      type: String,
      enum: ["profile", "uploaded"],
      required: true,
    },
    analysis: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      breakdown: {
        skill: { type: Number, min: 0, max: 100, default: 0 },
        experience: { type: Number, min: 0, max: 100, default: 0 },
        education: { type: Number, min: 0, max: 100, default: 0 },
        profile: { type: Number, min: 0, max: 100, default: 0 },
      },
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      summary: { type: String, default: "" },
      recommendation: { type: String, default: "" },
      confidence: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "low",
      },
    },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Shortlisted", "Rejected"],
      default: "Submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false },
);

// One application per student per job.
// A resubmission updates the existing application.
ApplicationSchema.index({ student: 1, job: 1 }, { unique: true });

export default mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);
