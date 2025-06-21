import { Schema, Types, model } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    image_url: String,
    vendorId: { type: Types.ObjectId, ref: 'Vendor', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategoryModel = model('Category', CategorySchema);
export default CategoryModel;
