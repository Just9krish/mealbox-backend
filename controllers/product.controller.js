import { catchAsyncErrorMiddleware } from '../middleware/index.js';
import { ErrorHandler, sendResponse } from '../utils/index.js';
import {
  ProductModel,
  ProductVariantModel,
  VendorModel,
  CategoryModel,
} from '../models/index.js';
import { FOOD_TYPE } from '../constant.js';
import mongoose from 'mongoose';
import slugify from 'slugify';

// Helper function to generate unique slug
const generateUniqueSlug = async (name, vendorId, excludeId = null) => {
  let baseSlug = slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  let slug = baseSlug;
  let counter = 1;

  // Build query to check for existing slug
  const query = { slug, vendorId };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  // Keep trying until we find a unique slug
  while (await ProductModel.findOne(query)) {
    slug = `${baseSlug}-${counter}`;
    query.slug = slug;
    counter++;
  }

  return slug;
};

// Create a new product with variants
const createProduct = catchAsyncErrorMiddleware(async (req, res) => {
  const {
    name,
    description,
    image_url,
    vendorId,
    categoryId,
    foodType,
    variants,
  } = req.body;

  // Validate food type
  if (!Object.values(FOOD_TYPE).includes(foodType)) {
    throw new ErrorHandler('Invalid food type', 400);
  }

  // Check if vendor exists
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new ErrorHandler('Vendor not found', 404);
  }

  // Check if category exists and belongs to the vendor
  const category = await CategoryModel.findOne({ _id: categoryId, vendorId });
  if (!category) {
    throw new ErrorHandler(
      'Category not found or does not belong to this vendor',
      404
    );
  }

  // Check if product with same name exists for this vendor
  const existingProduct = await ProductModel.findOne({ name, vendorId });
  if (existingProduct) {
    throw new ErrorHandler(
      'Product with this name already exists for this vendor',
      400
    );
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(name, vendorId);

  // Create product
  const product = await ProductModel.create({
    name,
    slug,
    description,
    image_url,
    vendorId,
    categoryId,
    foodType,
  });

  // Create variants if provided
  let productVariants = [];
  if (variants && Array.isArray(variants) && variants.length > 0) {
    const variantData = variants.map((variant) => ({
      productId: product._id,
      label: variant.label,
      actualPrice: variant.actualPrice,
      discountedPrice: variant.discountedPrice,
      unitType: variant.unitType,
      value: variant.value,
      stock: variant.stock,
    }));

    productVariants = await ProductVariantModel.insertMany(variantData);
  }

  // Get complete product with variants
  const completeProduct = await ProductModel.aggregate([
    { $match: { _id: product._id } },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'productvariants',
        localField: '_id',
        foreignField: 'productId',
        as: 'variants',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        description: 1,
        image_url: 1,
        vendorId: 1,
        categoryId: 1,
        foodType: 1,
        isActive: 1,
        vendor: {
          _id: '$vendor._id',
          name: '$vendor.name',
          logoUrl: '$vendor.logoUrl',
        },
        category: {
          _id: '$category._id',
          name: '$category.name',
        },
        variants: {
          $filter: {
            input: '$variants',
            as: 'variant',
            cond: { $eq: ['$$variant.isActive', true] },
          },
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  sendResponse({
    res,
    status: true,
    code: 201,
    message: 'Product created successfully',
    data: completeProduct[0],
  });
});

// Get all products with advanced filtering and pagination
const getAllProducts = catchAsyncErrorMiddleware(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    vendorId,
    categoryId,
    foodType,
    isActive,
    minPrice,
    maxPrice,
    inStock,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (page - 1) * limit;

  // Build match conditions
  const matchConditions = {};

  if (search) {
    matchConditions.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  if (vendorId) {
    matchConditions.vendorId = vendorId;
  }

  if (categoryId) {
    matchConditions.categoryId = categoryId;
  }

  if (foodType && Object.values(FOOD_TYPE).includes(foodType)) {
    matchConditions.foodType = foodType;
  }

  if (isActive !== undefined) {
    matchConditions.isActive = isActive === 'true';
  }

  // Build sort conditions
  const sortConditions = {};
  sortConditions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Aggregate pipeline
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
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'productvariants',
        localField: '_id',
        foreignField: 'productId',
        as: 'variants',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        minPrice: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.discountedPrice',
            },
          },
        },
        maxPrice: {
          $max: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.discountedPrice',
            },
          },
        },
        totalStock: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.stock',
            },
          },
        },
        activeVariants: {
          $size: {
            $filter: {
              input: '$variants',
              as: 'variant',
              cond: { $eq: ['$$variant.isActive', true] },
            },
          },
        },
      },
    },
  ];

  // Add price filtering if provided
  if (minPrice || maxPrice) {
    const priceConditions = {};
    if (minPrice) priceConditions.$gte = parseFloat(minPrice);
    if (maxPrice) priceConditions.$lte = parseFloat(maxPrice);
    pipeline.push({ $match: { minPrice: priceConditions } });
  }

  // Add stock filtering if provided
  if (inStock === 'true') {
    pipeline.push({ $match: { totalStock: { $gt: 0 } } });
  }

  // Add sorting
  pipeline.push({ $sort: sortConditions });

  // Add pagination facet
  pipeline.push({
    $facet: {
      products: [
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            description: 1,
            image_url: 1,
            vendorId: 1,
            categoryId: 1,
            foodType: 1,
            isActive: 1,
            minPrice: 1,
            maxPrice: 1,
            totalStock: 1,
            activeVariants: 1,
            vendor: {
              _id: '$vendor._id',
              name: '$vendor.name',
              logoUrl: '$vendor.logoUrl',
            },
            category: {
              _id: '$category._id',
              name: '$category.name',
            },
            variants: {
              $filter: {
                input: '$variants',
                as: 'variant',
                cond: { $eq: ['$$variant.isActive', true] },
              },
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ],
      totalCount: [{ $count: 'count' }],
    },
  });

  const result = await ProductModel.aggregate(pipeline);
  const products = result[0].products;
  const totalCount = result[0].totalCount[0]?.count || 0;

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Products retrieved successfully',
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit),
      },
    },
  });
});

// Get product by ID with complete details
const getProductById = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;

  const product = await ProductModel.aggregate([
    { $match: { _id: id } },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'productvariants',
        localField: '_id',
        foreignField: 'productId',
        as: 'variants',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        minPrice: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.discountedPrice',
            },
          },
        },
        maxPrice: {
          $max: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.discountedPrice',
            },
          },
        },
        totalStock: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.stock',
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        description: 1,
        image_url: 1,
        vendorId: 1,
        categoryId: 1,
        foodType: 1,
        isActive: 1,
        minPrice: 1,
        maxPrice: 1,
        totalStock: 1,
        vendor: {
          _id: '$vendor._id',
          name: '$vendor.name',
          logoUrl: '$vendor.logoUrl',
          description: '$vendor.description',
        },
        category: {
          _id: '$category._id',
          name: '$category.name',
          image_url: '$category.image_url',
        },
        variants: {
          $filter: {
            input: '$variants',
            as: 'variant',
            cond: { $eq: ['$$variant.isActive', true] },
          },
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!product || product.length === 0) {
    throw new ErrorHandler('Product not found', 404);
  }

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Product retrieved successfully',
    data: product[0],
  });
});

// Get product by slug with complete details
const getProductBySlug = catchAsyncErrorMiddleware(async (req, res) => {
  const { slug } = req.params;

  const product = await ProductModel.aggregate([
    { $match: { slug: slug } },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'productvariants',
        localField: '_id',
        foreignField: 'productId',
        as: 'variants',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        minPrice: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.discountedPrice',
            },
          },
        },
        maxPrice: {
          $max: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.discountedPrice',
            },
          },
        },
        totalStock: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.stock',
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        description: 1,
        image_url: 1,
        vendorId: 1,
        categoryId: 1,
        foodType: 1,
        isActive: 1,
        minPrice: 1,
        maxPrice: 1,
        totalStock: 1,
        vendor: {
          _id: '$vendor._id',
          name: '$vendor.name',
          logoUrl: '$vendor.logoUrl',
          description: '$vendor.description',
        },
        category: {
          _id: '$category._id',
          name: '$category.name',
          image_url: '$category.image_url',
        },
        variants: {
          $filter: {
            input: '$variants',
            as: 'variant',
            cond: { $eq: ['$$variant.isActive', true] },
          },
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!product || product.length === 0) {
    throw new ErrorHandler('Product not found', 404);
  }

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Product retrieved successfully',
    data: product[0],
  });
});

// Update product
const updateProduct = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, categoryId, foodType, isActive } =
    req.body;

  // Check if product exists
  const existingProduct = await ProductModel.findById(id);
  if (!existingProduct) {
    throw new ErrorHandler('Product not found', 404);
  }

  // Validate food type if provided
  if (foodType && !Object.values(FOOD_TYPE).includes(foodType)) {
    throw new ErrorHandler('Invalid food type', 400);
  }

  // Check if category exists and belongs to the vendor if categoryId is being updated
  if (categoryId && categoryId !== existingProduct.categoryId.toString()) {
    const category = await CategoryModel.findOne({
      _id: categoryId,
      vendorId: existingProduct.vendorId,
    });
    if (!category) {
      throw new ErrorHandler(
        'Category not found or does not belong to this vendor',
        404
      );
    }
  }

  // Check if name is being updated and if it conflicts with another product for the same vendor
  if (name && name !== existingProduct.name) {
    const nameConflict = await ProductModel.findOne({
      name,
      vendorId: existingProduct.vendorId,
      _id: { $ne: id },
    });
    if (nameConflict) {
      throw new ErrorHandler(
        'Product with this name already exists for this vendor',
        400
      );
    }
  }

  // Generate new slug if name is being updated
  let slug = existingProduct.slug;
  if (name && name !== existingProduct.name) {
    slug = await generateUniqueSlug(name, existingProduct.vendorId, id);
  }

  // Update product
  const updatedProduct = await ProductModel.findByIdAndUpdate(
    id,
    {
      name: name || existingProduct.name,
      slug: slug,
      description:
        description !== undefined ? description : existingProduct.description,
      image_url:
        image_url !== undefined ? image_url : existingProduct.image_url,
      categoryId: categoryId || existingProduct.categoryId,
      foodType: foodType || existingProduct.foodType,
      isActive: isActive !== undefined ? isActive : existingProduct.isActive,
    },
    { new: true }
  );

  // Get updated product with complete details
  const completeProduct = await ProductModel.aggregate([
    { $match: { _id: updatedProduct._id } },
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'productvariants',
        localField: '_id',
        foreignField: 'productId',
        as: 'variants',
      },
    },
    {
      $unwind: {
        path: '$vendor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        description: 1,
        image_url: 1,
        vendorId: 1,
        categoryId: 1,
        foodType: 1,
        isActive: 1,
        vendor: {
          _id: '$vendor._id',
          name: '$vendor.name',
          logoUrl: '$vendor.logoUrl',
        },
        category: {
          _id: '$category._id',
          name: '$category.name',
        },
        variants: {
          $filter: {
            input: '$variants',
            as: 'variant',
            cond: { $eq: ['$$variant.isActive', true] },
          },
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Product updated successfully',
    data: completeProduct[0],
  });
});

// Delete product (soft delete by setting isActive to false)
const deleteProduct = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  // Soft delete product
  await ProductModel.findByIdAndUpdate(id, { isActive: false });

  // Soft delete all variants
  await ProductVariantModel.updateMany({ productId: id }, { isActive: false });

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Product deleted successfully',
    data: null,
  });
});

// Toggle product active status
const toggleProductStatus = catchAsyncErrorMiddleware(async (req, res) => {
  const { id } = req.params;

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  product.isActive = !product.isActive;
  await product.save();

  // Toggle all variants status to match product status
  await ProductVariantModel.updateMany(
    { productId: id },
    { isActive: product.isActive }
  );

  sendResponse({
    res,
    status: true,
    code: 200,
    message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
    data: product,
  });
});

// Get products by vendor
const getProductsByVendor = catchAsyncErrorMiddleware(async (req, res) => {
  const { vendorId } = req.params;
  const { page = 1, limit = 10, categoryId, foodType, isActive } = req.query;
  const skip = (page - 1) * limit;

  // Check if vendor exists
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new ErrorHandler('Vendor not found', 404);
  }

  // Build match conditions
  const matchConditions = { vendorId };

  if (categoryId) {
    matchConditions.categoryId = categoryId;
  }

  if (foodType && Object.values(FOOD_TYPE).includes(foodType)) {
    matchConditions.foodType = foodType;
  }

  if (isActive !== undefined) {
    matchConditions.isActive = isActive === 'true';
  }

  const products = await ProductModel.aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'productvariants',
        localField: '_id',
        foreignField: 'productId',
        as: 'variants',
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        minPrice: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.discountedPrice',
            },
          },
        },
        maxPrice: {
          $max: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.discountedPrice',
            },
          },
        },
        totalStock: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $eq: ['$$variant.isActive', true] },
                },
              },
              as: 'variant',
              in: '$$variant.stock',
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        image_url: 1,
        categoryId: 1,
        foodType: 1,
        isActive: 1,
        minPrice: 1,
        maxPrice: 1,
        totalStock: 1,
        category: {
          _id: '$category._id',
          name: '$category.name',
        },
        variants: {
          $filter: {
            input: '$variants',
            as: 'variant',
            cond: { $eq: ['$$variant.isActive', true] },
          },
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: parseInt(skip) },
    { $limit: parseInt(limit) },
  ]);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Products retrieved successfully',
    data: products,
  });
});

// Get product statistics
const getProductStats = catchAsyncErrorMiddleware(async (req, res) => {
  const { vendorId, categoryId } = req.query;

  // Build match conditions
  const matchConditions = {};
  if (vendorId) {
    matchConditions.vendorId = vendorId;
  }
  if (categoryId) {
    matchConditions.categoryId = categoryId;
  }

  const stats = await ProductModel.aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: 'productvariants',
        localField: '_id',
        foreignField: 'productId',
        as: 'variants',
      },
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
        inactiveProducts: {
          $sum: { $cond: ['$isActive', 0, 1] },
        },
        vegProducts: {
          $sum: { $cond: [{ $eq: ['$foodType', FOOD_TYPE.VEG] }, 1, 0] },
        },
        nonVegProducts: {
          $sum: { $cond: [{ $eq: ['$foodType', FOOD_TYPE.NON_VEG] }, 1, 0] },
        },
        totalVariants: {
          $sum: {
            $size: {
              $filter: {
                input: '$variants',
                as: 'variant',
                cond: { $eq: ['$$variant.isActive', true] },
              },
            },
          },
        },
        totalStock: {
          $sum: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$variants',
                    as: 'variant',
                    cond: { $eq: ['$$variant.isActive', true] },
                  },
                },
                as: 'variant',
                in: '$$variant.stock',
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalProducts: 1,
        activeProducts: 1,
        inactiveProducts: 1,
        vegProducts: 1,
        nonVegProducts: 1,
        totalVariants: 1,
        totalStock: 1,
      },
    },
  ]);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Product statistics retrieved successfully',
    data: stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
      vegProducts: 0,
      nonVegProducts: 0,
      totalVariants: 0,
      totalStock: 0,
    },
  });
});

// Export all functions as default object
export default {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductsByVendor,
  getProductStats,
};
