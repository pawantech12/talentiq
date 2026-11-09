import mongoose from "mongoose";

const PendingRegistrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 254,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "recruiter"],
      required: true,
    },

    profile: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    otpHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    resendAvailableAt: {
      type: Date,
      required: true,
    },

    sendsWindowStartedAt: {
      type: Date,
      required: true,
    },

    sendsInWindow: {
      type: Number,
      default: 1,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    strict: true,
  },
);

export default mongoose.models.PendingRegistration ||
  mongoose.model("PendingRegistration", PendingRegistrationSchema);
