import { catchAsyncErrorMiddleware } from '../middleware/index.js';
import { ErrorHandler, sendResponse } from '../utils/index.js';
import {
  CartModel,
  CartItemModel,
  ProductVariantModel,
  ProductModel,
  UserModel,
} from '../models/index.js';
import mongoose from 'mongoose';

// Get user's cart with all items and details
const getUserCart = catchAsyncErrorMiddleware(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  // Get or create cart for user
  let cart = await CartModel.findOne({ userId });
  if (!cart) {
    cart = await CartModel.create({ userId });
  }

  // Get cart items with product details
  const cartItems = await CartItemModel.aggregate([
    { $match: { cartId: cart._id } },
    {
      $lookup: {
        from: 'productvariants',
        localField: 'productVariantId',
        foreignField: '_id',
        as: 'productVariant',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productVariant.productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $lookup: {
        from: 'vendors',
        localField: 'product.vendorId',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: {
        path: '$productVariant',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$product',
        preserveNullAndEmptyArrays: true,
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
        currentPrice: '$productVariant.discountedPrice',
        currentStock: '$productVariant.stock',
        isAvailable: {
          $and: [
            { $eq: ['$productVariant.isActive', true] },
            { $eq: ['$product.isActive', true] },
            { $gt: ['$productVariant.stock', 0] },
          ],
        },
        priceDifference: {
          $subtract: ['$priceSnapshot', '$productVariant.discountedPrice'],
        },
      },
    },
    {
      $project: {
        _id: 1,
        cartId: 1,
        productVariantId: 1,
        quantity: 1,
        priceSnapshot: 1,
        labelSnapshot: 1,
        addedAt: 1,
        currentPrice: 1,
        currentStock: 1,
        isAvailable: 1,
        priceDifference: 1,
        productVariant: {
          _id: '$productVariant._id',
          label: '$productVariant.label',
          actualPrice: '$productVariant.actualPrice',
          discountedPrice: '$productVariant.discountedPrice',
          unitType: '$productVariant.unitType',
          value: '$productVariant.value',
          stock: '$productVariant.stock',
          isActive: '$productVariant.isActive',
        },
        product: {
          _id: '$product._id',
          name: '$product.name',
          slug: '$product.slug',
          description: '$product.description',
          image_url: '$product.image_url',
          foodType: '$product.foodType',
          isActive: '$product.isActive',
        },
        vendor: {
          _id: '$vendor._id',
          name: '$vendor.name',
          logoUrl: '$vendor.logoUrl',
        },
        category: {
          _id: '$category._id',
          name: '$category.name',
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { addedAt: -1 } },
  ]);

  // Calculate cart summary
  const cartSummary = cartItems.reduce(
    (summary, item) => {
      if (item.isAvailable) {
        summary.totalItems += item.quantity;
        summary.subtotal += item.currentPrice * item.quantity;
        summary.totalItemsCount += 1;
      } else {
        summary.unavailableItems += item.quantity;
        summary.unavailableItemsCount += 1;
      }
      return summary;
    },
    {
      totalItems: 0,
      subtotal: 0,
      totalItemsCount: 0,
      unavailableItems: 0,
      unavailableItemsCount: 0,
    }
  );

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Cart retrieved successfully',
    data: {
      cart: {
        _id: cart._id,
        userId: cart.userId,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
      items: cartItems,
      summary: cartSummary,
    },
  });
});

// Add item to cart
const addToCart = catchAsyncErrorMiddleware(async (req, res) => {
  const { userId } = req.params;
  const { productVariantId, quantity = 1 } = req.body;

  // Validate quantity
  if (quantity <= 0) {
    throw new ErrorHandler('Quantity must be greater than 0', 400);
  }

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  // Check if product variant exists and is active
  const productVariant = await ProductVariantModel.findById(productVariantId);
  if (!productVariant) {
    throw new ErrorHandler('Product variant not found', 404);
  }

  if (!productVariant.isActive) {
    throw new ErrorHandler('Product variant is not available', 400);
  }

  // Check if product is active
  const product = await ProductModel.findById(productVariant.productId);
  if (!product || !product.isActive) {
    throw new ErrorHandler('Product is not available', 400);
  }

  // Check stock availability
  if (productVariant.stock < quantity) {
    throw new ErrorHandler(
      `Only ${productVariant.stock} items available in stock`,
      400
    );
  }

  // Get or create cart for user
  let cart = await CartModel.findOne({ userId });
  if (!cart) {
    cart = await CartModel.create({ userId });
  }

  // Check if item already exists in cart
  const existingCartItem = await CartItemModel.findOne({
    cartId: cart._id,
    productVariantId,
  });

  if (existingCartItem) {
    // Update quantity if item already exists
    const newQuantity = existingCartItem.quantity + quantity;

    // Check if new quantity exceeds stock
    if (productVariant.stock < newQuantity) {
      throw new ErrorHandler(
        `Only ${productVariant.stock} items available in stock`,
        400
      );
    }

    // Update existing cart item
    const updatedCartItem = await CartItemModel.findByIdAndUpdate(
      existingCartItem._id,
      {
        quantity: newQuantity,
        priceSnapshot: productVariant.discountedPrice,
        labelSnapshot: productVariant.label,
        addedAt: new Date(),
      },
      { new: true }
    );

    sendResponse({
      res,
      status: true,
      code: 200,
      message: 'Cart item updated successfully',
      data: updatedCartItem,
    });
  } else {
    // Create new cart item
    const newCartItem = await CartItemModel.create({
      cartId: cart._id,
      productVariantId,
      quantity,
      priceSnapshot: productVariant.discountedPrice,
      labelSnapshot: productVariant.label,
      addedAt: new Date(),
    });

    sendResponse({
      res,
      status: true,
      code: 201,
      message: 'Item added to cart successfully',
      data: newCartItem,
    });
  }
});

// Update cart item quantity
const updateCartItemQuantity = catchAsyncErrorMiddleware(async (req, res) => {
  const { userId, itemId } = req.params;
  const { quantity } = req.body;

  // Validate quantity
  if (quantity <= 0) {
    throw new ErrorHandler('Quantity must be greater than 0', 400);
  }

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  // Get user's cart
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ErrorHandler('Cart not found', 404);
  }

  // Check if cart item exists and belongs to user's cart
  const cartItem = await CartItemModel.findOne({
    _id: itemId,
    cartId: cart._id,
  });

  if (!cartItem) {
    throw new ErrorHandler('Cart item not found', 404);
  }

  // Check if product variant is still available
  const productVariant = await ProductVariantModel.findById(
    cartItem.productVariantId
  );
  if (!productVariant || !productVariant.isActive) {
    throw new ErrorHandler('Product variant is no longer available', 400);
  }

  // Check stock availability
  if (productVariant.stock < quantity) {
    throw new ErrorHandler(
      `Only ${productVariant.stock} items available in stock`,
      400
    );
  }

  // Update cart item
  const updatedCartItem = await CartItemModel.findByIdAndUpdate(
    itemId,
    {
      quantity,
      priceSnapshot: productVariant.discountedPrice,
      labelSnapshot: productVariant.label,
      addedAt: new Date(),
    },
    { new: true }
  );

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Cart item quantity updated successfully',
    data: updatedCartItem,
  });
});

// Remove item from cart
const removeFromCart = catchAsyncErrorMiddleware(async (req, res) => {
  const { userId, itemId } = req.params;

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  // Get user's cart
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ErrorHandler('Cart not found', 404);
  }

  // Check if cart item exists and belongs to user's cart
  const cartItem = await CartItemModel.findOne({
    _id: itemId,
    cartId: cart._id,
  });

  if (!cartItem) {
    throw new ErrorHandler('Cart item not found', 404);
  }

  // Remove cart item
  await CartItemModel.findByIdAndDelete(itemId);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Item removed from cart successfully',
    data: null,
  });
});

// Clear entire cart
const clearCart = catchAsyncErrorMiddleware(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  // Get user's cart
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ErrorHandler('Cart not found', 404);
  }

  // Remove all cart items
  await CartItemModel.deleteMany({ cartId: cart._id });

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Cart cleared successfully',
    data: null,
  });
});

// Get cart summary (lightweight version)
const getCartSummary = catchAsyncErrorMiddleware(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  // Get user's cart
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    sendResponse({
      res,
      status: true,
      code: 200,
      message: 'Cart summary retrieved successfully',
      data: {
        totalItems: 0,
        subtotal: 0,
        totalItemsCount: 0,
        unavailableItems: 0,
        unavailableItemsCount: 0,
      },
    });
    return;
  }

  // Get cart summary using aggregation
  const cartSummary = await CartItemModel.aggregate([
    { $match: { cartId: cart._id } },
    {
      $lookup: {
        from: 'productvariants',
        localField: 'productVariantId',
        foreignField: '_id',
        as: 'productVariant',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productVariant.productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $unwind: {
        path: '$productVariant',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$product',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        currentPrice: '$productVariant.discountedPrice',
        isAvailable: {
          $and: [
            { $eq: ['$productVariant.isActive', true] },
            { $eq: ['$product.isActive', true] },
            { $gt: ['$productVariant.stock', 0] },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalItems: {
          $sum: {
            $cond: ['$isAvailable', '$quantity', 0],
          },
        },
        subtotal: {
          $sum: {
            $cond: [
              '$isAvailable',
              { $multiply: ['$currentPrice', '$quantity'] },
              0,
            ],
          },
        },
        totalItemsCount: {
          $sum: {
            $cond: ['$isAvailable', 1, 0],
          },
        },
        unavailableItems: {
          $sum: {
            $cond: ['$isAvailable', 0, '$quantity'],
          },
        },
        unavailableItemsCount: {
          $sum: {
            $cond: ['$isAvailable', 0, 1],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalItems: 1,
        subtotal: 1,
        totalItemsCount: 1,
        unavailableItems: 1,
        unavailableItemsCount: 1,
      },
    },
  ]);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Cart summary retrieved successfully',
    data: cartSummary[0] || {
      totalItems: 0,
      subtotal: 0,
      totalItemsCount: 0,
      unavailableItems: 0,
      unavailableItemsCount: 0,
    },
  });
});

// Export all functions as default object
export default {
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartSummary,
};
