import mongoose, { Schema, Document } from "mongoose";
export interface RequestLogType extends Document {
  url: string;
  type: string;
  data: string;
  response: string | null | undefined;
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
