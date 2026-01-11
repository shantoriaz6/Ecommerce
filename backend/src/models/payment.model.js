import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    tran_id: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'BDT'
    },
    status: {
      type: String,
      enum: ['initiated', 'success', 'failed', 'cancelled'],
      default: 'initiated'
    },
    orderData: {
      type: mongoose.Schema.Types.Mixed
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed
    },
    val_id: {
      type: String
    }
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
