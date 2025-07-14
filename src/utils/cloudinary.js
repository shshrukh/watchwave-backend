import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

const uploadOnCloudnary = async function(filePath) {
    try {
        if(!filePath) return null;
        const responce = await cloudinary.uploader.upload(filePath,{resource_type : "auto"})
        console.log("file is uploaded at cloudnary ",responce.url);
        return responce; 
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
}

export default uploadOnCloudnary;