import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded successfully. URL:", response.url);

        // fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);

        // if (localFilePath && fs.existsSync(localFilePath)) {
        //     fs.unlinkSync(localFilePath);
        // }

        return null;
    }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return null;
    }
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted successfully. Result:", result);
    return result;
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    return null;
  }
};

(async function () {
    try {
        const demoRemoteImageUrl = 'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg';
        console.log(`\n--- Demonstration: Uploading remote image and transformations ---`);
        console.log(`Attempting to upload remote image: ${demoRemoteImageUrl}`);

        const uploadResult = await cloudinary.uploader.upload(
            demoRemoteImageUrl,
            {
                public_id: 'shoes_demo_upload',
                resource_type: "image"
            }
        );

        console.log("Demo Upload Result (URL):", uploadResult.url);
        console.log("Demo Upload Result (Public ID):", uploadResult.public_id);

        const optimizeUrl = cloudinary.url(uploadResult.public_id, {
            fetch_format: 'auto',
            quality: 'auto'
        });
        console.log("Demo Optimized URL:", optimizeUrl);

        const autoCropUrl = cloudinary.url(uploadResult.public_id, {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500,
            fetch_format: 'auto',
            quality: 'auto'
        });
        console.log("Demo Auto-Cropped URL:", autoCropUrl);

    } catch (error) {
        console.error("Cloudinary Demonstration Error:", error);
    }
})();

export { uploadCloudinary };