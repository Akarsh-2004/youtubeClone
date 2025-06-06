import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import asyncHandler  from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new APIError(401, "Unauthorized request");
        }

        // Decode token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Get user from database
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new APIError(401, "Invalid Access Token");
        }

        req.user = user;  // Correct assignment: lowercase `user`, not `User`
        next();
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid access token");
    }
});
