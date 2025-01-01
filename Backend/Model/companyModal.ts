import mongoose, { Schema } from "mongoose";
import { ICompany, ICompanyMember } from "../Interfaces/commonInterface";

const memberSchema: Schema = new Schema<ICompanyMember>({
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "Member"],
  },
  status: {
    type: String,
    default: "pending",
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
});

const companySchema: Schema = new Schema({
  companyName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  refferalCode: {
    type: String,
    required: true,
  },
  members: [memberSchema],
});

const Company = mongoose.model<ICompany>("Company", companySchema);
export default Company;
