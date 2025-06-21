import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const CartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', unique: true },
  },
  { timestamps: true }
);

const CartModel = mongoose.model('Cart', CartSchema);

export default CartModel;
