import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const GroupMemberItemSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: 'Group' },
    userId: { type: Types.ObjectId, ref: 'User' },
    productVariantId: { type: Types.ObjectId, ref: 'ProductVariant' },
    quantity: Number,
    priceSnapshot: Number,
    labelSnapshot: String,
    addedAt: Date,
  },
  { timestamps: true }
);

const GroupMemberItemModel = mongoose.model(
  'GroupMemberItem',
  GroupMemberItemSchema
);

export default GroupMemberItemModel;
