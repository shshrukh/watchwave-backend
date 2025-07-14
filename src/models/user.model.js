import mongoose ,{Schema} from "mongoose";

const userSchema =new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    fullname: {
        type : String,
        required : true,
        index : true,
        trim : true
    },
    avatar : {
        type : String,
        required : true,
    },
    coverimage : {
        type : String,
        required : true
    }, 
    watchHistory : [
        {
            type : mongoose.Types.ObjectId,
            ref : "Video"
        }
    ],
    passowrd : {
        type : String,
        required : [true, "password is required"]
    },
    refreshToken : {
        type : String
    }
    
},
{
    timestamps : true
}
)

export const User = mongoose.model("User", userSchema);

