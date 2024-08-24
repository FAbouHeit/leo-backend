import mongoose from "mongoose";
import { emailRegex } from "../../Utils/Regex.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
    },
    userName: {
      type: String,
      required: true,
      minlength: 4,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: emailRegex,
        message: "Error: Invalid email!",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 12,
    },
    isOTP: {
      type: Boolean,
      required: true,
    },
    isActivated: {
      type: Boolean,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["super", "admin", "user"],
    },
    activationCode: {
      type: String,
      required: false,
    },
    activationCodeCreatedAt: {
      type: Date,
      required: false,
    },
    tfaCode: {
      type: String,
      required: false,
    },
    tfaCodeCreatedAt: {
      type: Date,
      required: false
    },
    tfaAttemptNumber: {
      type: Number,
      required: true
    },
    tfaSent: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
