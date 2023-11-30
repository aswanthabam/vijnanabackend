import mongoose, { Schema, Types, Document } from "mongoose";
import { UserI } from "./User";
export interface TeamType extends Document {
  id: string;
  name: string;
  participate: Schema.Types.ObjectId;
  members: UserI;
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
      type: Types.ObjectId,
      ref: "Games",
    },
    members: {
      type: Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);
export type TeamI = TeamType & Document;
export const Team = mongoose.model("Teams", teamSchema);
