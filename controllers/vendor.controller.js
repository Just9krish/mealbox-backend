import { catchAsyncErrorMiddleware } from '../middleware/index.js';
import { ErrorHandler, sendResponse } from '../utils/index.js';
import { VendorModel } from '../models/index.js';
import mongoose from 'mongoose';

// Create a new vendor
export const createVendor = catchAsyncErrorMiddleware(async (req, res) => {
  const { name, logoUrl, description } = req.body;

  // Check if vendor with same name already exists
  const existingVendor = await VendorModel.findOne({ name });
  if (existingVendor) {
    throw new ErrorHandler('Vendor with this name already exists', 400);
  }

  const vendor = await VendorModel.create({
    name,
    logoUrl,
    description,
  });

  sendResponse({
    res,
    status: true,
    code: 201,
    message: 'Vendor created successfully',
    data: vendor,
  });
});

// Get all vendors with pagination and search
export const getAllVendors = catchAsyncErrorMiddleware(async (req, res) => {
  const { page = 1, limit = 10, search = '', isActive } = req.query;
  const skip = (page - 1) * limit;

  // Build match conditions
  const matchConditions = {};

  if (search) {
    matchConditions.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (isActive !== undefined) {
    matchConditions.isActive = isActive === 'true';
  }

  // Aggregate pipeline
  const pipeline = [
    { $match: matchConditions },
    {
      $facet: {
        vendors: [
          { $skip: parseInt(skip) },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 1,
              name: 1,
              logoUrl: 1,
              description: 1,
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

  const result = await VendorModel.aggregate(pipeline);
  const vendors = result[0].vendors;
  const totalCount = result[0].totalCount[0]?.count || 0;

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Vendors retrieved successfully',
    data: {
      vendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit),
      },
    },
  });
});

// Get vendor by ID
export const getVendorById = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;

  const vendor = await VendorModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $project: {
        _id: 1,
        name: 1,
        logoUrl: 1,
        description: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!vendor || vendor.length === 0) {
    throw new ErrorHandler('Vendor not found', 404);
  }

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Vendor retrieved successfully',
    data: vendor[0],
  });
});

// Update vendor
export const updateVendor = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;
  const { name, logoUrl, description, isActive } = req.body;

  // Check if vendor exists
  const existingVendor = await VendorModel.findById(id);
  if (!existingVendor) {
    throw new ErrorHandler('Vendor not found', 404);
  }

  // Check if name is being updated and if it conflicts with another vendor
  if (name && name !== existingVendor.name) {
    const nameConflict = await VendorModel.findOne({ name, _id: { $ne: id } });
    if (nameConflict) {
      throw new ErrorHandler('Vendor with this name already exists', 400);
    }
  }

  // Update vendor using aggregate for better control
  const updatedVendor = await VendorModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $addFields: {
        name: { $ifNull: [name, '$name'] },
        logoUrl: { $ifNull: [logoUrl, '$logoUrl'] },
        description: { $ifNull: [description, '$description'] },
        isActive: { $ifNull: [isActive, '$isActive'] },
        updatedAt: new Date(),
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        logoUrl: 1,
        description: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  // Update the document
  await VendorModel.findByIdAndUpdate(id, {
    name: name || existingVendor.name,
    logoUrl: logoUrl || existingVendor.logoUrl,
    description:
      description !== undefined ? description : existingVendor.description,
    isActive: isActive !== undefined ? isActive : existingVendor.isActive,
  });

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Vendor updated successfully',
    data: updatedVendor[0],
  });
});

// Delete vendor
export const deleteVendor = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;

  const vendor = await VendorModel.findById(id);
  if (!vendor) {
    throw new ErrorHandler('Vendor not found', 404);
  }

  await VendorModel.findByIdAndDelete(id);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Vendor deleted successfully',
    data: null,
  });
});

// Toggle vendor active status
export const toggleVendorStatus = catchAsyncErrorMiddleware(
  async (req, res) => {
    const { id } = req.params;

    const vendor = await VendorModel.findById(id);
    if (!vendor) {
      throw new ErrorHandler('Vendor not found', 404);
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    sendResponse({
      res,
      status: true,
      code: 200,
      message: `Vendor ${vendor.isActive ? 'activated' : 'deactivated'} successfully`,
      data: vendor,
    });
  }
);

// Get vendor statistics
export const getVendorStats = catchAsyncErrorMiddleware(async (req, res) => {
  const stats = await VendorModel.aggregate([
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        activeVendors: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
        inactiveVendors: {
          $sum: { $cond: ['$isActive', 0, 1] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalVendors: 1,
        activeVendors: 1,
        inactiveVendors: 1,
      },
    },
  ]);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Vendor statistics retrieved successfully',
    data: stats[0] || {
      totalVendors: 0,
      activeVendors: 0,
      inactiveVendors: 0,
    },
  });
});
