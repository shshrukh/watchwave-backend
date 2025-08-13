import asyncHnadler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudinary.js"
import { AipRespince } from "../utils/ApiResponse.js";



const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({validateBeforeSave: false})
}



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
        coverImage : coverImage.url || "",
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "somthing went wrong while registring a user");
    }
    
    return res.status(201).json(
        new AipRespince(200, createdUser, "user registered successfully")
    )
    

});


const loginUser = asyncHnadler( async ( req, res) => {

    const { username, password, email} = req.body;
    if( !username || !email ) {throw new ApiError( 400, "all fields are required")};
    if( !password ){ throw new ApiError(400, "password is required")};
    const user = await User.findOne({ $or: [{ username },{ email }]});

    if ( !user ) {
        throw new ApiError(404, "user does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect( password )

    if (!isPasswordValid){
        throw new ApiError(401, "email or password are incorrect");
    }  
});

export { registerUser} 