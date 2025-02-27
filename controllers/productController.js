const uploadImages = require('../middleware/uploadImages');
const uploadToGoogleDrive = require('../middleware/uploadToGoogleDrive');
const Product =require('../models/productModel')
const driveService = require('../middleware/uploadToGoogleDrive');

// Create a new product
const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    console.log(product)
    const savedProduct = await product.save();
    res.status(201).json({ message: 'Product created successfully!', data: savedProduct });
  } catch (error) {
    next(error);
  }
};

// Get all products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ message: 'Products retrieved successfully!', data: products });
  } catch (error) {
    next(error);
  }
};

//Get A Product by Category
const getProductByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;

    // Use aggregate to match products by category
    const products = await Product.aggregate([
      { $match: { Category: category } },
    ]);

    // Check if any products were found
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this category!' });
    }

    // Return the products if found
    res.status(200).json({
      message: 'Products retrieved successfully!',
      data: products,
    });
  } catch (error) {
    next(error); // Pass error to error handler
  }
};


// Get a single product by ID
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
    }
    res.status(200).json({ message: 'Product retrieved successfully!', data: product });
  } catch (error) {
    next(error);
  }
};

// Update a product by ID
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // // Fetch existing product
    // const existingProduct = await Product.findById(id);
    // if (!existingProduct) {
    //   return res.status(404).json({ message: "Product not found!" });
    // }

    // // Create an object to store only the changed fields
    // const updatedData = {};

    // // Compare each field in `req.body` with the existing product data
    // for (const key in req.body) {
    //   if (req.body[key] !== existingProduct[key]) {
    //     updatedData[key] = req.body[key];
    //   }
    // }

    // // Ensure required fields are not removed
    // if (updatedData.Image === null || updatedData.Image === undefined) {
    //   updatedData.Image = existingProduct.Image; // Retain existing value
    // }
    // if (updatedData.mainImage === null || updatedData.mainImage === undefined) {
    //   updatedData.mainImage = existingProduct.mainImage; // Retain existing value
    // }
    // updatedData.secondaryImages=[updatedData.secondaryImages,...existingProduct.secondaryImages]
    // // If no fields were changed, return a message
    // if (Object.keys(updatedData).length === 0) {
    //   return res.status(200).json({ message: "No changes detected!", data: existingProduct });
    // }

    // // Update product with only the changed fields
    // const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
    //   new: true, // Return the updated document
    //   runValidators: true, // Run schema validators on update
    // });

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true, // Returns the updated document
      runValidators: true, // Ensures validation is applied
    });

console.log(updatedProduct,'up')
    res.status(200).json({ message: "Product updated successfully!", data: updatedProduct });
  } catch (error) {
    next(error);
  }
};


// Delete a product by ID
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
    }
    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    next(error);
  }
};
const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const driveFile = await driveService.uploadToGoogleDrive(file);
    res.status(200).json({ message: 'File uploaded successfully', driveFile });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Failed to upload file to Google Drive.' });
  }
};

// Export all controllers
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByCategory,
  uploadFile
};
