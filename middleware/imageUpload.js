const fs = require("fs");
const path = require("path");
const multer = require("multer");
const dotenv = require('dotenv');
const { log } = require("console");
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

  // Configure to accept multiple files for secondaryImages as an array
  const uploadFields = [
    { name: 'mainImage', maxCount: 1 }, // Single upload for mainImage
    { name: 'secondaryImages', maxCount: 5 }, // Multiple uploads for secondary images
    {name:"Image",maxCount:1}
  ];
  
  upload.fields(uploadFields)(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      // Handle main image upload
      let mainImageUrl = null;
      if (req.files.mainImage && req.files.mainImage[0]) {
        const mainImagePath = req.files.mainImage[0].path;
        const mainImageResult = await cloudinary.uploader.upload(mainImagePath, {
          folder: "Product-IMG",
        });
        mainImageUrl = mainImageResult.secure_url;
        console.log("Main image uploaded successfully:", mainImageUrl);
      }

      // Handle secondary images
      let secondaryImagesUrls = [];
      if (req.files.secondaryImages) {
        for (const file of req.files.secondaryImages) {
          const secondaryImagePath = file.path;
          const result = await cloudinary.uploader.upload(secondaryImagePath, {
            folder: "Product-IMG",
          });
          secondaryImagesUrls.push(result.secure_url);
          console.log("Secondary image uploaded successfully:", result.secure_url);
        }
      }

      // Update the request body with Cloudinary URLs
      if (mainImageUrl) {
        req.body.mainImage = mainImageUrl;
      }
      if (secondaryImagesUrls.length > 0) {
        req.body.secondaryImages = secondaryImagesUrls;
      }

      // Clean up uploaded files
      for (const file of req.files.mainImage || []) {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting local file:", unlinkErr);
          } else {
            console.log("Local file deleted successfully.");
          }
        });
      }

      for (const file of req.files.secondaryImages || []) {
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
