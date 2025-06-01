import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload function for local file path
const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("File has been uploaded to Cloudinary");
        return response;
    } catch (error) {
        console.error("Upload Error:", error);
        return null;
    }
};

// Main function
(async function () {
    // Example: Upload from remote URL directly (via 'upload' with `public_id`)
    try {
        const uploadResult = await cloudinary.uploader.upload(
            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
            { public_id: 'shoes', resource_type: "image" }
        );

        console.log("Upload Result:", uploadResult);

        // Optimize delivery by resizing and applying auto-format and auto-quality
        const optimizeUrl = cloudinary.url('shoes', {
            fetch_format: 'auto',
            quality: 'auto'
        });
        console.log("Optimized URL:", optimizeUrl);

        // Transform the image: auto-crop to square aspect ratio
        const autoCropUrl = cloudinary.url('shoes', {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500
        });
        console.log("Auto-Cropped URL:", autoCropUrl);
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
    }
})();

export { uploadCloudinary };
