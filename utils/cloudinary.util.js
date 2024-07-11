import cloudinary from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // Click 'View Credentials' below to copy your API secret
  secure: true,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file on Cloudinary and remove the locally stored file
    const response = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File upload successful", response.url);
    fs.unlinkSync(localFilePath); // Remove the locally stored file as the upload to the cloud got successful.
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Remove the locally stored file as the upload to the cloud got failed.
    return null;
  }
};

// Function to upload image from a base64 string
export const uploadBase64Image = async (base64String) => {
  try {
    const response = await cloudinary.v2.uploader.upload(
      `data:image/jpeg;base64,${base64String}`,
      {
        resource_type: "image",
      }
    );
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export const uploadVideoOnCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      filePath,
      {
        resource_type: "video",
        chunk_size: 100000000,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
          fs.unlinkSync(filePath);
        } else {
          resolve(result.secure_url); // Ensure you're returning the correct URL property
          fs.unlinkSync(filePath);
        }
      }
    );
  });
};
