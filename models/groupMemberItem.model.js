import { Schema, Types, model } from 'mongoose';

const GroupMemberItemSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: 'Group', required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    productVariantId: {
      type: Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },
    quantity: { type: Number, default: 1 },
    priceSnapshot: { type: Number, required: true },
    labelSnapshot: { type: String, required: true },
    addedAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GroupMemberItemModel = model('GroupMemberItem', GroupMemberItemSchema);
export default GroupMemberItemModel;
