import asyncHandler from "../utils/asyncHandler.js"
import {APIError} from "../utils/APIError.js"
import {User} from "../models/user.models.js" 
import {uploadCloudinary} from "../utils/cloudinary.js"
import { APIResponse } from "../utils/APIResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend  
  //validation - none empty
  //check if user already exists
  //check for images, check avatar
  //upload them to cloudinary,avatar
  //create user object - create entry in db
  //remove pass and refresh token feild from response
  //check user creation
  //return res
  console.log("starting to register user");
  
 /*get details */
  const {fullName, email, username, password}=req.body
  console.log("email ", email);

  /*check for rmpty fields*/
  if (fullName ==""){
    throw new APIError(400, "fullName is req")
  }
  if (email ==""){
    throw new APIError(400, "email is req")
  }
  if (username ==""){
    throw new APIError(400, "username is req")
  }
  if (password ==""){
    throw new APIError(400, "password is req")
  }


  /*check for already existing user */
  user.findOne({
    $or: [{username}, {Email}]
  })
  
  if(existedUser){
    throw new APIError(409, "user already exist")
  }

  /*checking for images and avatar */

  const avatarLocalPath= req.files?.avatar[0]?.path;
  const coverImageLocalPath=req.files?.coverImage[0]?.path;

  /*cheking for avatar */
  if(!avatarLocalPath){
    throw new APIError(400, "avatar file is required")
  }

  /*uploading to cloudinary */
  const avatar= await uploadCloudinary(avatarLocalPath)
  const coverImage= await uploadCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new APIError(400, "avatar file is required")
  }

  const user =await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email, 
    password,
    username: username.toLowercae()
  })
  const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new APIError(500, "server side error while regestring the user")
  }

  return res.status(201).json(
    new APIResponse(200, createdUser, "user is created succesfully")
  )
});

  
export {registerUser};