import { v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudnary = async function(filePath) {
    try {
        if(!filePath) return null;
        const responce = await cloudinary.uploader.upload(filePath,{resource_type : "auto"});
        console.log("file is uploaded at cloudnary ",responce.url);
    
        
        return responce; 
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
        
    }
}

export  { uploadOnCloudnary };