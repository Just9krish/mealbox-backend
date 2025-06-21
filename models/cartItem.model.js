import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const CartItemSchema = new Schema(
  {
    cartId: { type: Types.ObjectId, ref: 'Cart' },
    productVariantId: { type: Types.ObjectId, ref: 'ProductVariant' },
    quantity: Number,
    priceSnapshot: Number,
    labelSnapshot: String,
    addedAt: Date,
  },
  {
    timestamps: true,
  }
);

const CartItemModel = mongoose.model('CartItem', CartItemSchema);

export default CartItemModel;
