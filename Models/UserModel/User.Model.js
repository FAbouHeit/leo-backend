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
    isActivated: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
    },
    activationCode: {
      type: String,
      required: true,
    },
    activationCodeCreatedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
