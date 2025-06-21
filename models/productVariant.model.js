import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const ProductVariantSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: 'Product' },
    label: String,
    actualPrice: Number,
    discountedPrice: Number,
    unitType: String,
    value: Number,
    stock: Number,
  },
  { timestamps: true }
);

const ProductVariantModel = mongoose.model(
  'ProductVariant',
  ProductVariantSchema
);

export default ProductVariantModel;
