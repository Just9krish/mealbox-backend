import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const ProductSchema = new Schema(
  {
    name: String,
    description: String,
    image_url: String,
    vendorId: { type: Types.ObjectId, ref: 'Vendor' },
    categoryId: { type: Types.ObjectId, ref: 'Category' },
    foodType: { type: String, enum: FOOD_TYPE },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model('Product', ProductSchema);

export default ProductModel;
