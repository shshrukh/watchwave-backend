import asyncHnadler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudinary.js"
import { AipRespince } from "../utils/ApiResponse.js";


const registerUser = asyncHnadler( async (req, res) => {

    
    const { username, email, fullname, password } = req.body;
    if( [ username, email, fullname, password ].some(field => field?.trim() === "") ){
        throw new ApiError(400, "all filed are required")
    }
    const existedUser = await User.findOne({
        $or : [{ username },{ email }]
    })

    if(existedUser) {
        throw new ApiError(409,"user with email or username allready existed")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if( !avatarLocalPath){
        throw new ApiError(400, "avatar file is required");
    }
    const avatar = await uploadOnCloudnary(avatarLocalPath);
    const coverImage = await uploadOnCloudnary(coverImageLocalPath);


    if( !avatar ){
        throw new ApiError(400, "avatar file is required");
    }
    
    const user = await User.create({
        fullname,
        email, 
        password,
        username,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "somthing went wrong while registring a user");
    }
    
    return res.status(201).json(
        new AipRespince(200, createdUser, "user registered successfully")
    )
    

});


export { registerUser} 