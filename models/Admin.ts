import mongoose, { InferSchemaType, Schema, Document } from "mongoose";
export interface AdminType extends Document {
  token: string;
  expiry: Date;
}
const adminSchema = new Schema<AdminType>(
  {
    token: {
      type: String,
    },
    expiry: {
      type: Date,
    },
  },
  { timestamps: true }
);
// type User = InferSchemaType<typeof adminSchema>;
export type AdminI = AdminType & Document;
export const Admin = mongoose.model("Admin", adminSchema);
