const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // Click 'View Credentials' below to copy your API secret
  secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload file on Cloudinary and remove the locally stored file

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File upload successfull", response.url);
    fs.unlinkSync(localFilePath); //remove the locally stored file as the upload to the cloud got successful.
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally stored file as the upload to the cloud got failed.
    return null;
  }
};

const uploadVideoOnCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
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

module.exports = { uploadOnCloudinary, uploadVideoOnCloudinary };
