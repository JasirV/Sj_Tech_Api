const expres=require('express')
const connect =require('./config/dbConnect');
const errorHandler = require('./middleware/errorhandlerMiddleware');
const productRouter=require('./routes/productRoute')
const authRouter=require('./routes/authRouter')


const app =expres()
connect()
app.use('api/product/',productRouter)
app.use('api/auth',authRouter)
app.use(errorHandler);
 
module.exports=app