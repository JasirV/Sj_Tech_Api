const express =require('express')
const { loginUser } = require('../controllers/userContoller')
const router=express.Router()

router.post('/',loginUser)

module.exports=router