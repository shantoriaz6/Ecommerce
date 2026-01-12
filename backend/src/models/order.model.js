import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    shippingAddress: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'SSL Commerz'],
      default: 'Cash on Delivery'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    transactionId: {
      type: String
    },
    deliveryman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deliveryman"
    },
    assignedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    deliveryNotes: {
      type: String
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
