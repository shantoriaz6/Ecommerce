import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all products or by category
const getAllProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  const filter = { isActive: true };
  if (category) {
    filter.category = category;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// Get single product
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// Create product (Admin only)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, brand, discount } = req.body;

  if (!name || !description || !price || !category) {
    throw new ApiError(400, "All required fields must be provided");
  }

  let imageUrl = "";
  
  // Handle image upload if file is provided
  if (req.file) {
    const imageLocalPath = req.file.path;
    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    
    if (uploadedImage) {
      imageUrl = uploadedImage.url;
    }
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    image: imageUrl,
    stock: stock || 0,
    brand: brand || "",
    discount: discount || 0
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// Update product (Admin only)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock, brand, discount, isActive } = req.body;

  console.log('Update request - ID:', id);
  console.log('=== UPDATE PRODUCT REQUEST ===');
  console.log('Product ID:', id);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Category from body:', category);
  console.log('Category type:', typeof category);

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  console.log('BEFORE UPDATE - Product category:', product.category);

  // Handle image upload if new file is provided
  if (req.file) {
    const imageLocalPath = req.file.path;
    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    
    if (uploadedImage) {
      product.image = uploadedImage.url;
    }
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = price;
  if (category) {
    console.log('SETTING category to:', category);
    product.category = category;
    console.log('AFTER SETTING - product.category is now:', product.category);
  }
  if (stock !== undefined) product.stock = stock;
  if (brand !== undefined) product.brand = brand;
  if (discount !== undefined) product.discount = discount;
  if (isActive !== undefined) product.isActive = isActive;

  console.log('BEFORE SAVE - Product:', JSON.stringify(product.toObject(), null, 2));

  const savedProduct = await product.save();

  console.log('AFTER SAVE - Product category:', savedProduct.category);
  console.log('AFTER SAVE - Full product:', JSON.stringify(savedProduct.toObject(), null, 2));

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

// Delete product (Admin only)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
