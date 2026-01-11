import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Generate tokens
const generateAccessAndRefreshTokens = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token generation error:', error);
    throw new ApiError(
      500,
      `Failed to generate tokens: ${error.message}`
    );
  }
};

// Register admin
const registerAdmin = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  // Validate required fields
  if ([userName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if admin already exists
  const existedAdmin = await Admin.findOne({
    $or: [{ userName }, { email }]
  });

  if (existedAdmin) {
    throw new ApiError(409, "Admin with email or username already exists");
  }

  // Create admin
  const admin = await Admin.create({
    userName: userName.toLowerCase(),
    email,
    password
  });

  // Get created admin without sensitive data
  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering the admin");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin registered successfully"));
});

// Login admin
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  // Validate input
  if (!userName && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // Find admin
  const admin = await Admin.findOne({
    $or: [{ userName }, { email }]
  });

  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }

  // Check password
  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    admin._id
  );

  // Get admin data without sensitive information
  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  // Cookie options
  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          admin: loggedInAdmin,
          accessToken,
          refreshToken
        },
        "Admin logged in successfully"
      )
    );
});

// Logout admin
const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out"));
});

// Refresh admin access token
const refreshAdminToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Verify it's an admin token
    if (decoded.role !== 'admin') {
      throw new ApiError(403, "Invalid token type");
    }
    
    const admin = await Admin.findById(decoded._id);
    
    if (!admin) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (admin.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or revoked");
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);
    const safeAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { admin: safeAdmin, accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid or expired refresh token");
  }
});

export { registerAdmin, loginAdmin, logoutAdmin, refreshAdminToken };
