import mongoose, { Schema, Document } from "mongoose";
import { UserI } from "./User";
import { EventI } from "./Event";
export interface TeamType extends Document {
  id: string;
  name: string;
  participate: EventI;
  members: UserI[];
}
const teamSchema = new Schema<TeamType>(
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
    participate: {
      type: Schema.Types.ObjectId,
      ref: "Events",
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: "Users",
    },
  },
  { timestamps: true }
);
export type TeamI = TeamType & Document;
export const Team = mongoose.model("Teams", teamSchema);
