import mongoose, { Schema } from "mongoose";
import { EventI } from "./Event";
export interface EventRegType extends Document {
  event: EventI;
  userId: string;
  date: Date;
}

const eventRegSchema = new Schema<EventRegType>({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Events",
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
});

export type EventRegI = EventRegType & Document;
export const EventReg = mongoose.model("EventRegs", eventRegSchema);
