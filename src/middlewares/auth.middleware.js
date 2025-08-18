import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHnadler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHnadler ( async (req, res, next)=>{
    // get the access token
    // if not access token then throw errorr
    // verify the access tkoen 
    // if not verify then throw errorr
    // every thing of then call the next();

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(401, "Unauthorized request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in verifyJWT middleware:", error);
        
    }

})