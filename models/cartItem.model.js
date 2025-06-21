import { Schema, Types, model } from 'mongoose';

const CartItemSchema = new Schema(
  {
    cartId: { type: Types.ObjectId, ref: 'Cart', required: true },
    productVariantId: {
      type: Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },
    quantity: { type: Number, required: true },
    priceSnapshot: { type: Number, required: true },
    labelSnapshot: { type: String, required: true },
    addedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const CartItemModel = model('CartItem', CartItemSchema);
export default CartItemModel;
