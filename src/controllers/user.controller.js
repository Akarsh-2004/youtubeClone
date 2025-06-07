import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

/* Generate Access & Refresh Tokens */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new APIError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(500, "Token generation failed");
  }
};

/* Register User */
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (!fullName || !email || !username || !password) {
    throw new APIError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });
  if (existedUser) {
    throw new APIError(409, "User already exists");
  }

  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar file is required");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadCloudinary(coverImageLocalPath)
    : null;

  const newUser = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
  if (!createdUser) throw new APIError(500, "User registration failed");

  return res
    .status(201)
    .json(new APIResponse(201, createdUser, "User registered successfully"));
});

/* Login User */
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    throw new APIError(400, "Email/Username and Password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) throw new APIError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new APIError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new APIResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful"));
});

/* Logout User */
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: "" } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "Logged out successfully"));
});

/* Refresh Access Token */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new APIError(401, "Unauthorized request");

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("+refreshToken");

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new APIError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new APIResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
  } catch (error) {
    throw new APIError(401, error?.message || "Could not refresh token");
  }
});

/* Change Current Password */
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?.id);
  if (!user) throw new APIError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) throw new APIError(400, "Invalid old password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new APIResponse(200, {}, "Password updated successfully"));
});

/* Get Current User */
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new APIResponse(200, req.user, "Current user fetched"));
});

/* Update Account Details */
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new APIError(400, "Full name and email are required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?.id,
    { fullName, email },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new APIResponse(200, updatedUser, "User details updated"));
});


const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar file not found");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new APIError(500, "Error while uploading avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatar.url },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new APIResponse(200, updatedUser, "Avatar updated successfully"));
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new APIError(400, "Cover image file not found");
  }

  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new APIError(500, "Error while uploading cover image");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { coverImage: coverImage.url },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new APIResponse(200, updatedUser, "Cover image updated successfully"));
});


/* Export All */
export {
  registerUser,
  loginUser,
  logout,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};
