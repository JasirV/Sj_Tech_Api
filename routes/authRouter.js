const express =require('express')
const { loginUser, signupUser } = require('../controllers/userContoller')
const router=express.Router()

router.post('/',loginUser)
.post('/create',signupUser)

module.exports=router 