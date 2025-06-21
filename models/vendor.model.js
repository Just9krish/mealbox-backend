import { Schema, model } from 'mongoose';

const VendorSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    logoUrl: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const VendorModel = model('Vendor', VendorSchema);
export default VendorModel;
