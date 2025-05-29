import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: './.env' // Specify the path to your .env file
});

/*
 This is first way to import our database 
;(async () => {
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("ERRR", error);
            throw error
        })

        app.listen(process.env.PORT, ()={
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }catch(error){
        console.error("ERROR:", error)
        throw err
    }
})()

*/