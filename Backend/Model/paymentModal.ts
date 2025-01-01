import { Schema, model } from "mongoose";
import { IPayment } from "../Interfaces/commonInterface";

const paymentSchema: Schema = new Schema<IPayment>({
  admin_id: {
    type: String,
    ref: "Admin",
    required: true,
  },
  subscription: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  customer: {
    type: String,
  },
});

const Payment = model<IPayment>("Payment", paymentSchema);
export default Payment;
