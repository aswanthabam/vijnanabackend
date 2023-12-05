import mongoose, { Schema, Types, Document } from "mongoose";
import { EventRegI } from "./EventReg";
export interface EventType extends Document {
  id: string;
  name: string;
  description: string;
  type: string;
  image: string;
  date: Date;
  poster: string;
  details: string;
  docs: Array<String> | undefined;
  venue: string;
  reg_link: string | null;
  minpart: number;
  maxpart: number;
  closed: boolean;
  is_reg: boolean;
  is_team: boolean;
  gctian_only: boolean;
  participants: EventRegI[];
  teams: Types.ObjectId[] | null;
}
const eventSchema = new Schema<EventType>(
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
    details: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    reg_link: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    is_reg: {
      type: Boolean,
      default: true,
    },
    gctian_only: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    poster: {
      type: String,
    },
    docs: {
      type: Array<String>,
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
    participants: [{ type: Schema.Types.ObjectId, ref: "EventRegs" }],
    teams: {
      type: [Schema.Types.ObjectId],
      ref: "Teams",
    },
  },
  { timestamps: true }
);
export type EventI = EventType & Document;
export const Event = mongoose.model("Events", eventSchema);
