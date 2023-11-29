import mongoose, { Schema } from "mongoose";

const eventRegSchema = new Schema({
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
export const EventReg = mongoose.model("EventRegs", eventRegSchema);
