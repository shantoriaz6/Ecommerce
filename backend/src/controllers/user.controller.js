import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      console.error('Missing token secrets in environment variables');
      throw new ApiError(500, "Server configuration error: Missing token secrets");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token generation error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Token generation failed: ${error.message}`);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    fullName,
    userName,
    email,
    password,
    confirmPassword,
    sex,
    contactNumber,
    address,
    avatar,
  } = req.body;

  const finalFullName = (fullName || name || "").trim();
  const finalEmail = (email || "").trim().toLowerCase();
  const finalUserName = (userName || finalEmail.split("@")[0] || "").trim().toLowerCase();

  if (!finalFullName) throw new ApiError(400, "Full name is required");
  if (!finalEmail) throw new ApiError(400, "Email is required");
  if (!finalUserName) throw new ApiError(400, "Username is required");
  if (!password) throw new ApiError(400, "Password is required");
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const existingUser = await User.findOne({
    $or: [{ email: finalEmail }, { userName: finalUserName }],
  });
  if (existingUser) throw new ApiError(409, "User already exists");

  const user = await User.create({
    fullName: finalFullName,
    userName: finalUserName,
    email: finalEmail,
    password,
    sex,
    contactNumber,
    address,
    avatar: avatar || "",
  });

  const safeUser = await User.findById(user._id).select("-password -refreshToken");
  const tokens = await generateAccessAndRefreshTokens(user._id);

  return res
    .status(201)
    .cookie("accessToken", tokens.accessToken, cookieOptions)
    .cookie("refreshToken", tokens.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: safeUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
        "User registered successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, userName, email, password } = req.body;
  const finalIdentifier = (identifier || userName || email || "").trim().toLowerCase();

  if (!finalIdentifier) throw new ApiError(400, "Username or email is required");
  if (!password) throw new ApiError(400, "Password is required");

  const user = await User.findOne({
    $or: [{ email: finalIdentifier }, { userName: finalIdentifier }],
  });

  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const tokens = await generateAccessAndRefreshTokens(user._id);
  const safeUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", tokens.accessToken, cookieOptions)
    .cookie("refreshToken", tokens.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: safeUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
        "Login successful"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    await User.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { fullName, email, sex, contactNumber, address } = req.body;

  const updates = {};
  if (fullName) updates.fullName = fullName.trim();
  if (email) updates.email = email.trim().toLowerCase();
  if (sex !== undefined) updates.sex = sex;
  if (contactNumber !== undefined) updates.contactNumber = contactNumber;
  if (address) updates.address = address;

  // Handle avatar upload if file is provided
  if (req.file) {
    const avatarLocalPath = req.file.path;
    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    
    if (!avatarResponse) {
      throw new ApiError(500, "Failed to upload avatar");
    }
    
    updates.avatar = avatarResponse.secure_url || avatarResponse.url;
  }

  if (Object.keys(updates).length === 0) throw new ApiError(400, "No fields to update");

  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true })
    .select("-password -refreshToken");

  if (!updatedUser) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, updatedUser, "Account updated"));
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword) throw new ApiError(400, "Passwords are required");
  if (newPassword !== confirmPassword) throw new ApiError(400, "Passwords do not match");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const isOldValid = await user.isPasswordCorrect(oldPassword);
  if (!isOldValid) throw new ApiError(401, "Old password is incorrect");

  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing");

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or revoked");
    }

    const tokens = await generateAccessAndRefreshTokens(user._id);
    const safeUser = await User.findById(user._id).select("-password -refreshToken");

    return res
      .status(200)
      .cookie("accessToken", tokens.accessToken, cookieOptions)
      .cookie("refreshToken", tokens.refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { user: safeUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateAccountDetails,
  changePassword,
  refreshAccessToken,
};
