import { Schema, Types, model } from 'mongoose';

const OrderItemSchema = new Schema(
  {
    orderId: { type: Types.ObjectId, ref: 'Order', required: true },
    productVariantId: {
      type: Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },
    addedByUserId: { type: Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    priceSnapshot: { type: Number, required: true },
    labelSnapshot: { type: String, required: true },
  },
  { timestamps: true }
);

const OrderItemModel = model('OrderItem', OrderItemSchema);

export default OrderItemModel;
