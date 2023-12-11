import mongoose, { InferSchemaType, Model, Schema, Types } from "mongoose";
import { EventRegI, EventRegType } from "./EventReg";
import { TeamI } from "./Team";

export interface UserType extends Document {
  id: number;
  userId: string; // 1
  name: string; // 1
  email: string; // 1
  phone: string | null; // 2
  college: string | null; // 2
  course: string | null; // 2
  year: number | null; // 2
  gctian: boolean | null; // 2
  token: string | null; // 2
  is_google: boolean; // 1
  step: number; // 1
  is_admin: boolean; // 1
  password: string | null; // 1
  picture: string | null; // 1
  participate: [EventRegI]; // 2
  teams: [TeamI] | null; // 2
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserType>(
  {
    id: {
      type: Number,
      unique: true,
      default: 0,
    },
    password: {
      type: String,
      required: false,
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
      required: false,
    },
    college: {
      type: String,
      required: false,
    },
    course: {
      type: String,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    teams: {
      type: Schema.Types.ObjectId,
      ref: "Teams",
    },
    gctian: {
      type: Boolean,
      default: false,
    },
    is_google: {
      type: Boolean,
      default: false,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    step: {
      type: Number,
      default: 1,
    },
    participate: [{ type: Schema.Types.ObjectId, ref: "EventRegs" }],
    token: {
      type: String,
    },
  },
  { timestamps: true }
);
export type UserI = UserType & mongoose.Document;
// export type UserType = DocumentType<typeof userSchema>;
export const User: Model<UserType> = mongoose.model<UserType>(
  "Users",
  userSchema
);
