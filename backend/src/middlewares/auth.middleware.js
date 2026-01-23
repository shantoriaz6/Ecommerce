import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";





export const verifyjwt = asyncHandler(async (req, _, next) => {
    try {
        const bearerToken = req.headers?.authorization || req.headers?.Authorization;
        const headerToken = bearerToken?.startsWith("Bearer ")
            ? bearerToken.replace("Bearer ", "").trim()
            : undefined;

        const token = headerToken || req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid token request");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});