import mongoose from 'mongoose';
import { Schema } from './index.js';

const OrderItemSchema = new Schema(
  {
    orderId: { type: Types.ObjectId, ref: 'Order' },
    productVariantId: { type: Types.ObjectId, ref: 'ProductVariant' },
    addedByUserId: { type: Types.ObjectId, ref: 'User' },
    quantity: Number,
    priceSnapshot: Number,
    labelSnapshot: String,
  },
  { timestamps: true }
);

const OrderItemModel = mongoose.model('OrderItem', OrderItemSchema);

export default OrderItemModel;
