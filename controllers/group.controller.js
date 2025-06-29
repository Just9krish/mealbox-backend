import { catchAsyncErrorMiddleware } from '../middleware/index.js';
import { ErrorHandler, sendResponse } from '../utils/index.js';
import {
  GroupModel,
  GroupMemberModel,
  GroupMemberItemModel,
  ProductVariantModel,
} from '../models/index.js';
import crypto from 'crypto';

// Helper to generate a unique QR string
const generateQRToken = () => crypto.randomBytes(12).toString('hex');

// 1. Create Group
const createGroup = catchAsyncErrorMiddleware(async (req, res, next) => {
  const { name, scheduledAt, mode } = req.body;
  const userId = req.user?._id;

  if (!name || !scheduledAt || !mode) {
    return next(
      new ErrorHandler('Name, scheduledAt, and mode are required', 400)
    );
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    return next(
      new ErrorHandler('Scheduled time must be a valid future date/time', 400)
    );
  }

  // Generate unique QR token
  let qrToken;
  let isUnique = false;
  while (!isUnique) {
    qrToken = generateQRToken();
    const existing = await GroupModel.findOne({ qrToken });
    if (!existing) isUnique = true;
  }

  // Create group
  const group = await GroupModel.create({
    name,
    createdBy: userId,
    scheduledAt: scheduledDate,
    qrToken,
    mode,
  });

  // Add creator as group member (leader)
  await GroupMemberModel.create({
    groupId: group._id,
    userId,
    joinedAt: new Date(),
  });

  sendResponse({
    res,
    status: true,
    code: 201,
    message: 'Group created successfully',
    data: { group, qrToken },
  });
});

// 2. Join Group via QR Token
const joinGroup = catchAsyncErrorMiddleware(async (req, res, next) => {
  const { qrToken } = req.body;
  const userId = req.user?._id;

  if (!qrToken) return next(new ErrorHandler('QR token is required', 400));

  const group = await GroupModel.findOne({ qrToken });
  if (!group) return next(new ErrorHandler('Group not found', 404));

  // Check if already a member
  const existing = await GroupMemberModel.findOne({
    groupId: group._id,
    userId,
  });
  if (existing) return next(new ErrorHandler('Already joined this group', 400));

  await GroupMemberModel.create({
    groupId: group._id,
    userId,
    joinedAt: new Date(),
  });

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Joined group successfully',
    data: { groupId: group._id },
  });
});

// 3. Add/Update Item for User in Group
const addGroupItem = catchAsyncErrorMiddleware(async (req, res, next) => {
  const { groupId } = req.params;
  const { productVariantId, quantity } = req.body;
  const userId = req.user?._id;

  if (!groupId || !productVariantId || !quantity) {
    return next(
      new ErrorHandler(
        'groupId, productVariantId, and quantity are required',
        400
      )
    );
  }
  if (quantity <= 0) {
    return next(new ErrorHandler('Quantity must be greater than 0', 400));
  }

  // Validate group and membership
  const group = await GroupModel.findById(groupId);
  if (!group) return next(new ErrorHandler('Group not found', 404));
  const member = await GroupMemberModel.findOne({ groupId, userId });
  if (!member)
    return next(new ErrorHandler('You are not a member of this group', 403));

  // Validate product variant
  const variant = await ProductVariantModel.findById(productVariantId);
  if (!variant) return next(new ErrorHandler('Product variant not found', 404));
  if (variant.stock < quantity) {
    return next(
      new ErrorHandler(`Only ${variant.stock} items available in stock`, 400)
    );
  }

  // Add or update item
  let item = await GroupMemberItemModel.findOne({
    groupId,
    userId,
    productVariantId,
  });
  if (item) {
    item.quantity = quantity;
    item.priceSnapshot = variant.discountedPrice;
    item.labelSnapshot = variant.label;
    item.isActive = true;
    item.addedAt = new Date();
    await item.save();
  } else {
    item = await GroupMemberItemModel.create({
      groupId,
      userId,
      productVariantId,
      quantity,
      priceSnapshot: variant.discountedPrice,
      labelSnapshot: variant.label,
      addedAt: new Date(),
    });
  }

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Item added/updated in group',
    data: item,
  });
});

// 4. Delete Group (Leader Only)
const deleteGroup = catchAsyncErrorMiddleware(async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user?._id;

  const group = await GroupModel.findById(groupId);
  if (!group) return next(new ErrorHandler('Group not found', 404));
  if (String(group.createdBy) !== String(userId)) {
    return next(
      new ErrorHandler('Only the group leader can delete the group', 403)
    );
  }

  await GroupModel.deleteOne({ _id: groupId });
  await GroupMemberModel.deleteMany({ groupId });
  await GroupMemberItemModel.deleteMany({ groupId });

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Group deleted successfully',
    data: { groupId },
  });
});

export default {
  createGroup,
  joinGroup,
  addGroupItem,
  deleteGroup,
};
