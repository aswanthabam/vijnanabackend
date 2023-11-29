import mongoose, { InferSchemaType, Schema } from "mongoose";
const adminSchema = new Schema(
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
type User = InferSchemaType<typeof adminSchema>;

export const Admin = mongoose.model("Admin", adminSchema);
