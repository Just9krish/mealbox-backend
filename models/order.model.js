import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const OrderSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: 'User' },
    group_id: { type: Types.ObjectId, ref: 'Group' },
    mode: { type: String, enum: ORDER_MODE },
    status: { type: String, enum: ORDER_STATUS, default: 'CREATED' },
    payment_status: { type: String, enum: PAYMENT_STATUS, default: 'UNPAID' },
    transaction_id: { type: Types.ObjectId, ref: 'Transaction' },
    scheduled_at: Date,
    total_amount: Number,
    invoice: { type: String, unique: true },
    qr_token: { type: String, unique: true },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model('Order', OrderSchema);

export default OrderModel;
