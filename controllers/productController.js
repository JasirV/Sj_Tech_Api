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

    // Fetch existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found!" });
    }

    // Parse files from `req.files`
    const files = req.files || {};
    const uploadedImages = {};
    console.log("Files received:", req.body);

    // Process files for each field
    for (const field in files) {
      uploadedImages[field] = files[field].map((file) => file.path);
    }

    // Handle deletions and additions for `secondaryImages`
    const { deletedImages = [] } = req.body; // Array of image URLs to delete
    console.log("Deleted Images:", deletedImages);
    let secondaryImages = existingProduct.secondaryImages || [];

    // Remove deleted images
    secondaryImages = secondaryImages.filter(
      (image) => !deletedImages.includes(image)
    );

    // Add new uploaded images
    if (uploadedImages.secondaryImages) {
      secondaryImages = [...secondaryImages, ...uploadedImages.secondaryImages];
    }

    // Merge updated fields
    const updatedData = {
      ...req.body,
      secondaryImages,
      mainImage: uploadedImages.mainImage?.[0] || existingProduct.mainImage,
      Image: uploadedImages.Image?.[0] || existingProduct.Image,
    };

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json({ message: "Product updated successfully!", data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
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
