import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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

    emailVerified: {
      type: Boolean,
      default: true,
    },

    accountStatus: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
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
    timestamps: false,
    versionKey: false,
    strict: true,
  },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
