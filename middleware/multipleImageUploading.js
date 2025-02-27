import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: path.join(__dirname, "uploads"),
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).array('secondaryImages', 10);

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});

const multipleImage = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                status: 'error',
                message: err.message
            });
        }
        try {
            const imageUrls = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'secondaryImages',
                });
                imageUrls.push(result.secure_url);
            }
            req.body.images = imageUrls;
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Image upload failed',
                error: error.message
            });
        }
    });
};

export default multipleImage;