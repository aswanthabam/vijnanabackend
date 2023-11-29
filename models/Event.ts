import mongoose, { Schema, Types } from "mongoose";
const eventSchema = new Schema(
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
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    is_reg: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
    poster: {
      type: String,
    },
    docs: {
      type: Array,
    },
    date: {
      type: Date,
      required: true,
    },
    minpart: {
      type: Number,
      required: true,
    },
    maxpart: {
      type: Number,
      required: true,
    },
    closed: {
      type: Boolean,
      default: false,
    },
    is_team: {
      type: Boolean,
      default: false,
    },
    participants: [{ type: Types.ObjectId, ref: "EventRegs" }],
    teams: {
      type: [Types.ObjectId],
      ref: "Teams",
    },
  },
  { timestamps: true }
);
export const Event = mongoose.model("Events", eventSchema);
