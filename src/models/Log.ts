import mongoose, { Schema, Document } from "mongoose";
import { UserI } from "./User";
export interface RequestLogType extends Document {
  url: string;
  type: string;
  data: string;
  response: string | null | undefined;
  user: UserI | null | undefined;
  status: number | null | undefined;
}

export const requestSchema = new Schema<RequestLogType>(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      default: "",
    },
    response: {
      type: String,
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: false,
    },
    status: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

export type RequestLogI = RequestLogType & Document;
export const RequestLog = mongoose.model<RequestLogI>(
  "RequestLog",
  requestSchema
);

export interface ErrorLogType extends Document {
  route: string;
  error: string;
  stack: string | null | undefined;
  log: RequestLogI | null | undefined;
}

export const errorLogSchema = new Schema<ErrorLogType>({
  route: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    required: true,
  },
  log: {
    type: Schema.Types.ObjectId,
    ref: "RequestLog",
    required: false,
  },
  stack: {
    type: String,
    required: false,
  },
});

export type ErrorLogI = ErrorLogType & Document;
export const ErrorLog = mongoose.model<RequestLogI>("ErrorLog", errorLogSchema);
