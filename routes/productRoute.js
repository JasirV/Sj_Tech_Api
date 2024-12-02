const express=require('express')
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController')

const router=express.Router()

router.post('/',createProduct)
router.get('/',getAllProducts)
.get('/:id',getProductById)
.put('/:id',updateProduct)
.delete('/:id',deleteProduct)

module.exports=router