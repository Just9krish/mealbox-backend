import { Schema, Types, model } from 'mongoose';
import { ORDER_MODE, ORDER_STATUS, PAYMENT_STATUS } from '../constant';

const OrderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    groupId: { type: Types.ObjectId, ref: 'Group', required: true },
    mode: { type: String, enum: Object.values(ORDER_MODE), required: true },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    transactionId: {
      type: Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    invoice: { type: String, unique: true },
    qrToken: { type: String, unique: true },
  },
  { timestamps: true }
);

const OrderModel = model('Order', OrderSchema);
export default OrderModel;
