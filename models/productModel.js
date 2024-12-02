const mongoose=require('mongoose');

const ProductSchema = new mongoose.Schema({
  service_name: {
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true
  },
  mainImage: {
    type: String,
    required: true
  },
  aboutText: {
    type: String,
    required: true
  },
  additionalText: {
    type: String,
    required:true
  },
  featuresList: {
    type: [String], // Array of strings
    required: true
  },
  Category: {
    type: String,
    required: true
  },
  modernTitle: {
    type: String,
    required: true
  },
  secondaryImages: {
    type: [String], // Array of strings
    required: true
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const Product = mongoose.model('Product', ProductSchema);

module.exports=Product
