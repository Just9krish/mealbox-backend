import { Schema, Types, model } from 'mongoose';

const CartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', unique: true, required: true },
  },
  { timestamps: true }
);

const CartModel = model('Cart', CartSchema);
export default CartModel;
