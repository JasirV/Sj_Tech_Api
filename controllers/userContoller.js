const User=require('../models/userModel')
const bcrypt =require('bcrypt')
const jwt =require('jsonwebtoken')
const loginUser =async(req,res,next)=>{
  try {
    const {userName,password}=req.body
    const user=await User.findOne({userName:userName})
    if(!user){
      return res.status(404).json({
        status:'faile',
        message:"User Not Found"
      })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password!' });
    }
    const token = jwt.sign({ userName: user.userName }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expiration time
    });

    res.status(200).json({
      message: 'Login successful!',
      userName: user.userName,
      token,
    });
  } catch (error) {
    next(error)
  }
}

const signupUser=async (req,res,next)=>{
  try {
    const {userName,password}=req.body

    const exitss=await User.findOne({userName:userName})
    if(exitss){
      return res.status(404).json({
        status:"failed",
        message:'User Name oldrady exiset'
      })
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName: userName.trim(),
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: 'Signup successful!',
      userName: newUser.userName,
    });
  } catch (error) {
    next(error)
  }
} 
module.exports = { loginUser, signupUser };
