import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import { app } from "./app.js";

dotenv.config({path:'./.env'});

// console.log(process);


connectDB()
    .then(() => {
        app.on('error', err => {
            console.log("EXPRESS error", err); 
            throw err;
        });

        app.listen(process.env.PORT || 4000, () => {
            console.log("server is running on port 3000");
            
        })
    })
    .catch(err => console.log('MONGOOES db connect faild !!!', err))
    