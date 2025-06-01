import asyncHandler from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async (req, res) => {
  console.log("🔥 registerUser called");
  return res.status(200).json({ message: "ok" });
});


export {registerUser};