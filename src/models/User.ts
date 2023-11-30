import mongoose, { InferSchemaType, Model, Schema, Types } from "mongoose";
import { EventRegI, EventRegType } from "./EventReg";

export interface UserType extends Document {
  id: number;
  password: string;
  userId: string;
  email: string;
  name: string;
  dob: Date;
  picture: string;
  college: string;
  course: string;
  year: number;
  phone: string;
  teams: any;
  participate: [EventRegI];
  token: string;
  expiry: Date;
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
    participate: [{ type: Schema.Types.ObjectId, ref: "EventRegs" }],
    token: {
      type: String,
    },
    expiry: {
      type: Date,
    },
    dob: {
      type: Date,
      required: false,
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
