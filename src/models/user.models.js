import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        index:true,
        trim:true,
    },
    avatar:{
        type:String, //cloud url
        required:true,
    },
    coverImage:{
        type:String, //cloudinary url
    },
    watchHistory:{
        type: Schema.Types.ObjectId,
        ref:"Video"
    },
    password:{
        type:String,
        required:[true, 'Password is req']
    },
    refreshToken:{
        type:String,
    }
},
{
    timestamps: true
})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
})

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.nextTick.ACCESS_TOKEN_SECRET,
        {
            expiresIN: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.nextTick.REFRESH_TOKEN_SECRET,
        {
            expiresIN: process.env.REFRESH_TOKEN_EXPITY
        }
    )
}
export const User = mongoose.model("User", userSchema);