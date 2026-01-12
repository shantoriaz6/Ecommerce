import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const deliverymanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    vehicleType: {
      type: String,
      enum: ['bike', 'car', 'bicycle', 'van'],
      default: 'bike'
    },
    vehicleNumber: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    currentLocation: {
      latitude: Number,
      longitude: Number
    },
    totalDeliveries: {
      type: Number,
      default: 0
    },
    completedDeliveries: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5
    },
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);

// Hash password before saving
deliverymanSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
deliverymanSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
deliverymanSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: 'deliveryman'
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

// Generate refresh token
deliverymanSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: 'deliveryman'
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

export const Deliveryman = mongoose.model("Deliveryman", deliverymanSchema);
