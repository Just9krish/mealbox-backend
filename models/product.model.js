import { Schema, Types, model } from 'mongoose';
import { FOOD_TYPE } from '../constant.js';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true, index: true },
    description: { type: String, required: true },
    image_url: { type: String, required: false }, // Main image URL
    images: [
      {
        // Array of all images with metadata
        url: { type: String, required: true },
        display_url: { type: String, required: true },
        thumb_url: { type: String, required: true },
        medium_url: { type: String, required: true },
        delete_url: { type: String, required: true },
        filename: { type: String, required: true },
        size: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
    ],
    vendorId: { type: Types.ObjectId, ref: 'Vendor', required: true },
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    foodType: { type: String, enum: Object.values(FOOD_TYPE), required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductModel = model('Product', ProductSchema);
export default ProductModel;
