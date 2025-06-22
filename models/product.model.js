import { Schema, Types, model } from 'mongoose';
import { FOOD_TYPE } from '../constant.js';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image_url: { type: String, required: true },
    vendorId: { type: Types.ObjectId, ref: 'Vendor', required: true },
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    foodType: { type: String, enum: Object.values(FOOD_TYPE), required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductModel = model('Product', ProductSchema);
export default ProductModel;
