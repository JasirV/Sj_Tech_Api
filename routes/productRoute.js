const express=require('express')
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getProductByCategory, fileUploadingDrive, uploadFile } = require('../controllers/productController')
const uploadImage = require('../middleware/imageUpload')
const { authenticateToken } = require('../utils/authincation')
const multer = require('multer');
const path = require('path');
const uploadsPath = path.join(__dirname, 'uploads');
const upload = multer({ dest: uploadsPath });
const router=express.Router()

router.post('/',authenticateToken,uploadImage,createProduct)
router.get('/',getAllProducts)
.get('/:id',getProductById)
.put('/:id',authenticateToken,upload.none(),updateProduct)
.delete('/:id',authenticateToken,deleteProduct)
.get('/service/:category',getProductByCategory)
router.post('/upload', upload.single('file'), uploadFile);

module.exports=router 