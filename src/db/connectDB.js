import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Mongoes connected, connection Host: ${connectionInstance.connection.host}`);
        return connectionInstance;
        
    } catch (error) {
        console.log("ERROR: failed to connect DB,",error);
        process.exit(1);
    }
}

export default connectDB;