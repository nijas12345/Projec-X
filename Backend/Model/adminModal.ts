import { Schema, model } from "mongoose";
import { IAdmin } from "../Interfaces/commonInterface";

const adminSchema: Schema = new Schema<IAdmin>({
  admin_id: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  profileImage: {
    type: String,
    default: null,
  },
  address: {
    type: String,
  },
  state: {
    type: String,
  },
  companyId: {
    type: String,
  },
  position: {
    type: String,
  },
  city: {
    type: String,
  },
});

const Admin = model<IAdmin>("Admin", adminSchema);
export default Admin;
