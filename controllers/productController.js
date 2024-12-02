const Product =require('../models/productModel')


// Create a new product
const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
    }
    res.status(200).json({ message: 'Product updated successfully!', data: product });
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

// Export all controllers
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
