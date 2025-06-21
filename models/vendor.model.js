import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const VendorSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    logoUrl: String,
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const VendorModel = mongoose.model('Vendor', VendorSchema);

export default VendorModel;
