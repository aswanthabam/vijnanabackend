import mongoose, { InferSchemaType, Model, Schema, Types } from "mongoose";
import { EventRegI, EventRegType } from "./EventReg";
import { TeamI } from "./Team";

export interface UserType extends Document {
  id: number;
  userId: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  year: number;
  gctian: boolean;
  token: string;
  is_google: boolean;
  password: string | null;
  picture: string | null;
  participate: [EventRegI];
  teams: [TeamI] | null;
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
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
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
