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
    { name: "secondaryImages", maxCount: 5 },
    { name: "Image", maxCount: 1 },
  ];

  upload.fields(uploadFields)(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      let mainImageUrl = null;
      if (req.files.mainImage && req.files.mainImage[0]) {
        const mainImagePath = req.files.mainImage[0].path;
        const mainImageResult = await cloudinary.uploader.upload(mainImagePath, {
          folder: "Product-IMG",
        });
        mainImageUrl = mainImageResult.secure_url;
        console.log("Main image uploaded successfully:", mainImageUrl);
      }

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

      let imageFieldUrl = null;
      if (req.files.Image && req.files.Image[0]) {
        const imagePath = req.files.Image[0].path;
        const imageResult = await cloudinary.uploader.upload(imagePath, {
          folder: "Product-IMG",
        });
        imageFieldUrl = imageResult.secure_url;
        console.log("Image field uploaded successfully:", imageFieldUrl);
      }

      if (mainImageUrl) {
        req.body.mainImage = mainImageUrl;
      }
      if (secondaryImagesUrls.length > 0) {
        req.body.secondaryImages = secondaryImagesUrls;
      }
      if (imageFieldUrl) {
        req.body.Image = imageFieldUrl;
      }

      const deleteLocalFiles = (files) => {
        for (const file of files || []) {
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting local file:", unlinkErr);
            } else {
              console.log("Local file deleted successfully.");
            }
          });
        }
      };

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
