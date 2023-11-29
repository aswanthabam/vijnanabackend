import mongoose, { Schema, Types } from "mongoose";

const teamSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    participate: {
      type: Types.ObjectId,
      ref: "Games",
    },
    members: {
      type: Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);
export const Team = mongoose.model("Teams", teamSchema);
