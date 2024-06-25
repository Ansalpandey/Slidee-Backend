const cloudinary = require("cloudinary").v2;
const fs = require("fs");
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // Click 'View Credentials' below to copy your API secret
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

const uploadVideoOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        file,
        {
          resource_type: "video",
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
    console.log(`> Result: ${result.secure_url}`);
  } catch (error){
    fs.unlinkSync(localFilePath); //remove the locally stored file as the upload to the cloud got failed.
    return null;
  }
};

module.exports = uploadOnCloudinary;
module.exports = uploadVideoOnCloudinary;
