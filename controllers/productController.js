const uploadImages = require('../middleware/uploadImages');
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

    // Parse files and organize by field
    const files = req.files || [];
    const uploadedImages = {};

    // Map uploaded files to appropriate fields (Image, secondaryImages, etc.)
    files.forEach((file) => {
      if (!uploadedImages[file.fieldname]) {
        uploadedImages[file.fieldname] = [];
      }
      uploadedImages[file.fieldname].push(file.path); // Store file paths for each field
    });

    // Handle deletions and additions for `secondaryImages`
    const { deletedImages = [] } = req.body; // Array of image URLs to delete
    let secondaryImages = existingProduct.secondaryImages || [];

    // Remove deleted images from the `secondaryImages` array
    secondaryImages = secondaryImages.filter(
      (image) => !deletedImages.includes(image)
    );

    // Add new uploaded images to `secondaryImages`
    if (uploadedImages.secondaryImages) {
      secondaryImages = [...secondaryImages, ...uploadedImages.secondaryImages];
    }

    // Handle the main image, prioritizing the uploaded file if present
    const mainImage = uploadedImages.mainImage?.[0] || existingProduct.mainImage;
    const Image = uploadedImages.Image?.[0] || existingProduct.Image;

    // Handle the case where `mainImage` or `Image` is a URL instead of a file
    const updatedData = {
      ...req.body,
      secondaryImages,
      mainImage, // Update the mainImage, either from the uploaded file or existing data
      Image, // Update the Image field, either from the uploaded file or existing data
    };

    // Update product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Product updated successfully!",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    next(error); // Pass the error to the next middleware
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
  getProductByCategory
};
