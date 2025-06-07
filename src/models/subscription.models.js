import { Schema } from "mongoose";
import mongoose from "mongoose";

const subscriptionSchema= new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type: Schema.Types.ObjectId,  //one who is being subscribed
        ref:"User"
    }
},{timestamps:true})


export const subscription= mongoose.model("Subscription", subscriptionSchema)