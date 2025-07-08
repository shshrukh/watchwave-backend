import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";

dotenv.config({path:'./.env'});

console.log("helo");

connectDB();