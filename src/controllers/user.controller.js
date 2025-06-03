import asyncHandler from "../utils/asyncHandler.js"
import {APIError} from "../utils/APIError.js"
import {User} from "../models/user.models.js" 
import {uploadCloudinary} from "../utils/cloudinary.js"
import { APIResponse } from "../utils/APIResponse.js"

const generateAccessAndRefreshTokens = async(userId)=>{
  try{
    console.log(userId)
    const user= await User.findById(userId)
    const accessToken = user.generateAccessAndRefreshTokens()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken= refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken, refreshToken}
  }
  catch(error){
    throw new APIError(500, "something went wrong probably server error")
  }
}


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
  console.log("email", email);

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
  const existedUser = await User.findOne({
    $or: [{username}, {email}]
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
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email, 
    password,
    username: username.toLowerCase()
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

const loginUser = asyncHandler(async(req, res) =>{
    //req body ->data
    //email username
    //find the user
    //password check
    //check for eexisting user
    //access and refresh token

    const {email, username, password } = req.body
    if(!username  || !email){
      throw new APIError(400, "username or password is empty")
    }

   const user = await User.findOne({
      $or:[{username},{email}]
    })

    if(!user){
      throw new APIError(404, "user does not exist")
    }

    if(!password){
      throw new APIError(400, "please enter the password");
    }

    const isPasswordValid= await user.isPaswordCorrect(password)
    if(!isPasswordValid){
      throw new APIError(401, "invalid user credentials")
    }


    const {accessToken, refreshToken}=  await generateAccessAndRefreshTokens(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly: true,
        secure: true,
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
      200,
      {
        user:loggedInUser, accessToken, refreshToken
      }
    )
}) 


const logout = asyncHandler(async(req, res)=>{
    User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },
      {
        new: true
      }
    )

    const options ={
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken",options )
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "user logged out"))
})
export {
  registerUser, 
  loginUser,
  logout
};