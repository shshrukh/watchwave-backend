import asyncHnadler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudnary } from "../utils/cloudinary.js"
import { AipRespince } from "../utils/ApiResponse.js";



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError( "500", "something went wrong while generating access and refresh token")
    }
}



const registerUser = asyncHnadler(async (req, res) => {


    const { username, email, fullname, password } = req.body;
    if ([username, email, fullname, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "all filed are required")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "user with email or username allready existed")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required");
    }
    const avatar = await uploadOnCloudnary(avatarLocalPath);
    const coverImage = await uploadOnCloudnary(coverImageLocalPath);


    if (!avatar) {
        throw new ApiError(400, "avatar file is required");
    }

    const user = await User.create({
        fullname,
        email,
        password,
        username,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "somthing went wrong while registring a user");
    }

    return res.status(201).json(
        new AipRespince(200, createdUser, "user registered successfully")
    )


});

const loginUser = asyncHnadler(async (req, res) => {
   

    const { email, username, password } = req.body;
    if ( !( email || username) ) {
        throw new ApiError(400, "email or username is required");
    }
   
    
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    
    if (!user) {
        throw new ApiError(404, "user not found");
    }
   
    
    const isPasswordValid = await user.isPasswordCorrect(password);
   
    
    if (!isPasswordValid) {
        throw new ApiError(401, "password is not valid");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
    
    const loggenInUser = await User.findById(user._id).select("-password -rsrefreshToken");
    
    
    const options = {
        httpOnly : true, 
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new AipRespince(
            200,
            {
                user : loggenInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfuly"

        )
    )
});

const logoutUser = asyncHnadler (async (req, res) => {
    await User.findOneAndUpdate(
        req.user._id,
        {
            $set :{
                refreshToken : null
            }
        },
        {
            new : true
        }
    );
    const options = {
        httpOnly : true, 
        secure : true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new AipRespince(200, {}, "User logout successfully"))
});

const changePassword = asyncHnadler(async (req, res) => {

    const { password, newPassword } = req.body;
    console.log("password", password,"newPasseord", newPassword);
    
    
    if(!(password && newPassword)){
        throw new ApiError(400, "password and new password are required");
    }

    const user = await User.findById (req.user._id);
    if( !user ){
        throw new ApiError(404, "user not found");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "password is not valid");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(new AipRespince(200,{}, "password change successfuly"))
});

const currentUser = asyncHnadler (async(req, res) => {
    return res
    .status(200)
    .json(new AipRespince(200, req.user, "current user fetched successfuly"));
});

export { registerUser, loginUser ,logoutUser, changePassword,currentUser } 