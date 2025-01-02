const fs = require("fs");
const path = require("path");
const multer = require("multer");
const dotenv = require('dotenv');
dotenv.config();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});



const upload = multer({ storage });


const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
}); 


const uploadImage = (req, res, next) => {
    console.log("Starting upload process...");
  
    // Use multer to handle file uploads for multiple fields
    const uploadFields = [
      { name: 'mainImage', maxCount: 1 }, // Single upload for mainImage
      { name: 'secondaryImages', maxCount: 5 } // Multiple uploads for secondary images (adjust maxCount as needed)
    ];
  
    upload.fields(uploadFields)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
  
      try {
        // Handle main image upload to Cloudinary
        if (req.files.mainImage) {
          const mainImageResult = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
            folder: "Product-IMG",
          });
          req.body.mainImage = mainImageResult.secure_url; // Store the Cloudinary URL for the main image
        }
  
        // Handle secondary images (if any)
        if (req.files.secondaryImages) {
          const secondaryImagesUrls = [];
          for (const file of req.files.secondaryImages) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "Product-IMG",
            });
            secondaryImagesUrls.push(result.secure_url); // Store Cloudinary URLs for secondary images
          }
          req.body.secondaryImages = secondaryImagesUrls; // Update the body with Cloudinary URLs
        }
  
        // Clean up the uploaded files after uploading to Cloudinary
        for (const file of req.files.mainImage || []){
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting local file:", unlinkErr);
            } else {
              console.log("Local file deleted successfully.");
            }
          });
        }
  
        for (const file of req.files.secondaryImages || []){
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting local file:", unlinkErr);
            } else {
              console.log("Local file deleted successfully.");
            }
          });
        }
  
        // Proceed to next middleware
        next();
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        res.status(500).json({
          status: "fail",
          message: "Error uploading file(s) to Cloudinary",
        });
      }
    });
  };
  
  module.exports = uploadImage; 