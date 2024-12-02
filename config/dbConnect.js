const mongoose =require("mongoose");
const dotenv =require("dotenv");
dotenv.config()
const path=require('path');


// const __dirname = path.dirname(new URL(import.meta.url).pathname);
// dotenv.config({ path: path.join(__dirname, '.env') });


 const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://sjtechqa:ObM9hcjG6q3LJA76@sjtechbeta.c620n.mongodb.net/?retryWrites=true&w=majority&appName=sjtechbeta");
        console.log(`DB connected`);
    } catch (error) { 
        console.log(error);
    }
};

module.exports=connectDB