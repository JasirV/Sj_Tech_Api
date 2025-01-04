const expres=require('express')
const errorHandler = require('./middleware/errorhandlerMiddleware');
const productRouter=require('./routes/productRoute')
const authRouter=require('./routes/authRouter')
const cors = require("cors");
const bodyParser = require('body-parser');


const app =expres()
app.use(cors());
app.use(expres.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '100mb' })); 
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use('/api/product/',productRouter)
app.use('/api/auth/',authRouter)
app.use(errorHandler);
 
module.exports=app 