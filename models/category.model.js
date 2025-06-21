import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    image_url: String,
    vendorId: { type: Types.ObjectId, ref: 'Vendor' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model('Category', CategorySchema);

export default CategoryModel;
