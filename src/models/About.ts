import mongoose, { Schema, Document } from "mongoose";

export interface AboutType extends Document {
  name: string;
  start: Date;
  end: Date;
  about: string;
  contact: string;
  email: string;
}

export const aboutSchema = new Schema<AboutType>(
  {
    name: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export type AboutI = AboutType & Document;
export const About = mongoose.model<AboutI>("About", aboutSchema);
