import mongoose, { InferSchemaType, Schema, Types } from "mongoose";

const userSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
      default: 0,
    },
    password: {
      type: String,
    },
    userId: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      default: 1,
    },
    phone: {
      type: String,
      required: true,
    },
    teams: {
      type: Types.ObjectId,
      ref: "Teams",
    },
    participate: [{ type: Schema.Types.ObjectId, ref: "EventRegs" }],
    token: {
      type: String,
    },
    expiry: {
      type: Date,
    },
  },
  { timestamps: true }
);
export const User = mongoose.model("Users", userSchema);

export type UserType = InferSchemaType<typeof userSchema>;
