const app =require('./app')
const connect =require('./config/dbConnect');
const dotenv=require('dotenv')
dotenv.config()

const port=process.env.PORT
connect()
app.listen(port,()=>{
    console.log(`server run on ${port} `);
    
})  