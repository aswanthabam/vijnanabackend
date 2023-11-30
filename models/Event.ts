import mongoose, { Schema, Types, Document } from "mongoose";
import { UserI } from "./User";
import { EventRegI } from "./EventReg";
export interface EventType extends Document {
  id: string;
  name: string;
  description: string;
  type: string;
  is_reg: boolean;
  image: string;
  poster: string;
  docs: Array<String> | undefined;
  date: Date;
  minpart: number;
  maxpart: number;
  closed: boolean;
  is_team: boolean;
  participants: EventRegI[];
  teams: Types.ObjectId[];
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
