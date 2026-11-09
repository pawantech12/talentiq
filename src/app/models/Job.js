import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    industry: { type: String, trim: true, maxlength: 100, default: "" },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["0–3 Years", "3–5 Years", "5–8 Years", "8+ Years"],
      required: true,
    },
    salaryMin: { type: Number, min: 0, default: null },
    salaryMax: { type: Number, min: 0, default: null },
    description: { type: String, required: true, maxlength: 12000 },
    responsibilities: { type: String, required: true, maxlength: 12000 },
    requiredSkills: [{ type: String, trim: true, maxlength: 50 }],
    preferredSkills: [{ type: String, trim: true, maxlength: 50 }],
    educationRequirement: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    resumeSkillMatch: { type: Boolean, default: false },
    educationMatch: { type: Boolean, default: false },
    experienceMatch: { type: Boolean, default: false },
    requireSkillAssessment: { type: Boolean, default: false },
    assessmentType: {
      type: String,
      default: "Job-Specific Skill Assessment",
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["Active", "Draft", "Closed"],
      default: "Draft",
      index: true,
    },
    applicationCount: { type: Number, default: 0, min: 0 },
    aiMatch: { type: Number, default: 0, min: 0, max: 100 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

JobSchema.index({ recruiter: 1, createdAt: -1 });

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
