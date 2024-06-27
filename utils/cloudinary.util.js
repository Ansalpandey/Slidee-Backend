const cloudinary = require("cloudinary");
const fs = require("fs");
// Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // Click 'View Credentials' below to copy your API secret
  secure: true,
});

const uploadOnCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        reject(error);
        fs.unlinkSync(filePath);
      } else {
        // Delete the file if the upload succeeds
        resolve(result.secure_url); // Ensure you're returning the correct URL property
        fs.unlinkSync(filePath);
      }
    });
  });
};

const uploadVideoOnCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      filePath,
      {
        resource_type: "video",
        chunk_size: 600000000,
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

module.exports = { uploadOnCloudinary };
module.exports = { uploadVideoOnCloudinary };
