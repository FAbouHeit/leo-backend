import mongoose from "mongoose";

const securitySchema = new mongoose.Schema(
  {
    invalidLogin: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SecurityModel = mongoose.model("Security", securitySchema);

export default SecurityModel;
