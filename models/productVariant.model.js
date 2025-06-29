import { Schema, Types, model } from 'mongoose';

const ProductVariantSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: 'Product' },
    label: { type: String, required: true },
    actualPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    unitType: { type: String, required: true },
    value: { type: Number, required: true },
    stock: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductVariantModel = model('ProductVariant', ProductVariantSchema);
export default ProductVariantModel;
