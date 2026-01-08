import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
  const { name, description, price, category, image, stock, brand } = req.body;

  if (!name || !description || !price || !category) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    image: image || "",
    stock: stock || 0,
    brand: brand || ""
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// Update product (Admin only)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image, stock, brand, isActive } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = price;
  if (category) product.category = category;
  if (image !== undefined) product.image = image;
  if (stock !== undefined) product.stock = stock;
  if (brand !== undefined) product.brand = brand;
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();

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
