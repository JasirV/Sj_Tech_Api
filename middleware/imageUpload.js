const fs = require("fs");
const path = require("path");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const uploadImage = (req, res, next) => {
  console.log("Starting upload process...");

  const uploadFields = [
    { name: "mainImage", maxCount: 1 },
    { name: "secondaryImages", maxCount: 10 },
    { name: "Image", maxCount: 1 },
  ];

  upload.fields(uploadFields)(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      // Preserve existing values from the database
      const existingData = req.existingData || {}; // Pass existing data in middleware
      let mainImageUrl = existingData.mainImage || null;
      let secondaryImagesUrls = existingData.secondaryImages || [];
      let imageFieldUrl = existingData.Image || null;

      // Upload mainImage if provided
      if (req.files.mainImage && req.files.mainImage[0]) {
        const mainImagePath = req.files.mainImage[0].path;
        const mainImageResult = await cloudinary.uploader.upload(mainImagePath, {
          folder: "Product-IMG",
        });
        mainImageUrl = mainImageResult.secure_url;
      }

      // Append new secondaryImages and retain old ones
      if (req.files.secondaryImages) {
        for (const file of req.files.secondaryImages) {
          const secondaryImagePath = file.path;
          const result = await cloudinary.uploader.upload(secondaryImagePath, {
            folder: "Product-IMG",
          });
          secondaryImagesUrls.push(result.secure_url);
        }
      }

      // Upload Image if provided
      if (req.files.Image && req.files.Image[0]) {
        const imagePath = req.files.Image[0].path;
        const imageResult = await cloudinary.uploader.upload(imagePath, {
          folder: "Product-IMG",
        });
        imageFieldUrl = imageResult.secure_url;
      }

      // Update request body with final URLs
      req.body.mainImage = mainImageUrl;
      req.body.secondaryImages = secondaryImagesUrls;
      req.body.Image = imageFieldUrl;

      // Function to delete local files after upload
      const deleteLocalFiles = (files) => {
        for (const file of files || []) {
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting local file:", unlinkErr);
            }
          });
        }
      };

      // Clean up local uploaded files
      deleteLocalFiles(req.files.mainImage);
      deleteLocalFiles(req.files.secondaryImages);
      deleteLocalFiles(req.files.Image);

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
