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
    // req collect --> Data
    // access username or email 
    // find the user
    // checking password
    // generate access and refresh token

    const { email, username, password } = req.body;
    if (!email || !username) {
        throw new ApiError(400, "email or username is required");
    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "user not found");
    }
    const isPasswordVaid = await user.isPasswordValid(password);
    if (!isPasswordVaid) {
        throw new ApiError(401, "password is not valid");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
    const loggenInUser = await User.findById(user._id).select("-password - refreshToken");

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
                refreshToken : undefined
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

export { registerUser, loginUser ,logoutUser} 