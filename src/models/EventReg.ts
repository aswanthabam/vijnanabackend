import mongoose, { Schema } from "mongoose";
export interface EventRegType extends Document {
  eventId: string;
  userId: string;
  date: Date;
}

const eventRegSchema = new Schema<EventRegType>({
  eventId: {
    type: String,
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
