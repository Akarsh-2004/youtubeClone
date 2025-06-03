import { User } from "../models/user.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import  jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
export const verifyJWT = asyncHandler(async(req, _, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new APIError(401, "unauthorized request")
        }
    
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!User){
            throw new APIError(401, "Invalid Access Token")
        }

        req.User = User;
        next()
    } catch (error) {
        throw new APIError(401, error?.message || "invalid access token")
    }
})