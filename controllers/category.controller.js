import { catchAsyncErrorMiddleware } from '../middleware/index.js';
import { ErrorHandler, sendResponse } from '../utils/index.js';
import { CategoryModel, VendorModel } from '../models/index.js';
import mongoose from 'mongoose';

// Create a new category
const createCategory = catchAsyncErrorMiddleware(async (req, res) => {
  const { name, image_url, vendorId } = req.body;

  // Check if vendor exists
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new ErrorHandler('Vendor not found', 404);
  }

  // Check if category with same name exists for this vendor
  const existingCategory = await CategoryModel.findOne({ name, vendorId });
  if (existingCategory) {
    throw new ErrorHandler(
      'Category with this name already exists for this vendor',
      400
    );
  }

  const category = await CategoryModel.create({
    name,
    image_url,
    vendorId,
  });

  sendResponse({
    res,
    status: true,
    code: 201,
    message: 'Category created successfully',
    data: category,
  });
});

// Get all categories with pagination, search, and vendor filtering
const getAllCategories = catchAsyncErrorMiddleware(async (req, res) => {
  const { page = 1, limit = 10, search = '', vendorId, isActive } = req.query;
  const skip = (page - 1) * limit;

  // Build match conditions
  const matchConditions = {};

  if (search) {
    matchConditions.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  if (vendorId) {
    matchConditions.vendorId = new mongoose.Types.ObjectId(vendorId);
  }

  if (isActive !== undefined) {
    matchConditions.isActive = isActive === 'true';
  }

  // Aggregate pipeline with vendor lookup
  const pipeline = [
    { $match: matchConditions },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $facet: {
        categories: [
          { $skip: parseInt(skip) },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 1,
              name: 1,
              image_url: 1,
              vendorId: 1,
              vendor: {
                _id: '$vendor._id',
                name: '$vendor.name',
                logoUrl: '$vendor.logoUrl',
              },
              isActive: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const result = await CategoryModel.aggregate(pipeline);
  const categories = result[0].categories;
  const totalCount = result[0].totalCount[0]?.count || 0;

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Categories retrieved successfully',
    data: {
      categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit),
      },
    },
  });
});

// Get category by ID with vendor details
const getCategoryById = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;

  const category = await CategoryModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image_url: 1,
        vendorId: 1,
        vendor: {
          _id: '$vendor._id',
          name: '$vendor.name',
          logoUrl: '$vendor.logoUrl',
          description: '$vendor.description',
        },
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!category || category.length === 0) {
    throw new ErrorHandler('Category not found', 404);
  }

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Category retrieved successfully',
    data: category[0],
  });
});

// Update category
const updateCategory = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;
  const { name, image_url, vendorId, isActive } = req.body;

  // Check if category exists
  const existingCategory = await CategoryModel.findById(id);
  if (!existingCategory) {
    throw new ErrorHandler('Category not found', 404);
  }

  // Check if vendor exists if vendorId is being updated
  if (vendorId && vendorId !== existingCategory.vendorId.toString()) {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new ErrorHandler('Vendor not found', 404);
    }
  }

  // Check if name is being updated and if it conflicts with another category for the same vendor
  const targetVendorId = vendorId || existingCategory.vendorId;
  if (name && name !== existingCategory.name) {
    const nameConflict = await CategoryModel.findOne({
      name,
      vendorId: targetVendorId,
      _id: { $ne: id },
    });
    if (nameConflict) {
      throw new ErrorHandler(
        'Category with this name already exists for this vendor',
        400
      );
    }
  }

  // Update category
  const updatedCategory = await CategoryModel.findByIdAndUpdate(
    id,
    {
      name: name || existingCategory.name,
      image_url:
        image_url !== undefined ? image_url : existingCategory.image_url,
      vendorId: vendorId || existingCategory.vendorId,
      isActive: isActive !== undefined ? isActive : existingCategory.isActive,
    },
    { new: true }
  );

  // Get updated category with vendor details
  const categoryWithVendor = await CategoryModel.aggregate([
    { $match: { _id: updatedCategory._id } },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image_url: 1,
        vendorId: 1,
        vendor: {
          _id: '$vendor._id',
          name: '$vendor.name',
          logoUrl: '$vendor.logoUrl',
        },
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Category updated successfully',
    data: categoryWithVendor[0],
  });
});

// Delete category
const deleteCategory = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;

  const category = await CategoryModel.findById(id);
  if (!category) {
    throw new ErrorHandler('Category not found', 404);
  }

  await CategoryModel.findByIdAndDelete(id);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Category deleted successfully',
    data: null,
  });
});

// Toggle category active status
const toggleCategoryStatus = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;

  const category = await CategoryModel.findById(id);
  if (!category) {
    throw new ErrorHandler('Category not found', 404);
  }

  category.isActive = !category.isActive;
  await category.save();

  sendResponse({
    res,
    status: true,
    code: 200,
    message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
    data: category,
  });
});

// Get categories by vendor ID
const getCategoriesByVendor = catchAsyncErrorMiddleware(async (req, res) => {
  const { vendorId } = req.params;
  const { isActive } = req.query;

  // Check if vendor exists
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new ErrorHandler('Vendor not found', 404);
  }

  // Build match conditions
  const matchConditions = { vendorId: new mongoose.Types.ObjectId(vendorId) };

  if (isActive !== undefined) {
    matchConditions.isActive = isActive === 'true';
  }

  const categories = await CategoryModel.aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image_url: 1,
        vendorId: 1,
        vendor: {
          _id: '$vendor._id',
          name: '$vendor.name',
          logoUrl: '$vendor.logoUrl',
        },
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Categories retrieved successfully',
    data: categories,
  });
});

// Get category statistics
const getCategoryStats = catchAsyncErrorMiddleware(async (req, res) => {
  const { vendorId } = req.query;

  // Build match conditions
  const matchConditions = {};
  if (vendorId) {
    matchConditions.vendorId = new mongoose.Types.ObjectId(vendorId);
  }

  const stats = await CategoryModel.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
        inactiveCategories: {
          $sum: { $cond: ['$isActive', 0, 1] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalCategories: 1,
        activeCategories: 1,
        inactiveCategories: 1,
      },
    },
  ]);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Category statistics retrieved successfully',
    data: stats[0] || {
      totalCategories: 0,
      activeCategories: 0,
      inactiveCategories: 0,
    },
  });
});

// Export all functions as default object
export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoriesByVendor,
  getCategoryStats,
};
