const express=require('express')
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getProductByCategory } = require('../controllers/productController')
const uploadImage = require('../middleware/imageUpload')
const { authenticateToken } = require('../utils/authincation')


const router=express.Router()

router.post('/',authenticateToken,uploadImage,createProduct)
router.get('/',getAllProducts)
.get('/:id',getProductById)
.put('/:id',authenticateToken,uploadImage,updateProduct)
.delete('/:id',authenticateToken,deleteProduct)
.get('/service/:category',getProductByCategory)

module.exports=router 