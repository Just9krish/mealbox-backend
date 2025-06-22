import { Schema, Types, model } from 'mongoose';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../constant.js';

const TransactionSchema = new Schema(
  {
    orderId: {
      type: Types.ObjectId,
      ref: 'Order',
      unique: true,
      required: true,
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    amount: { type: Number, required: true },
    transactionRef: { type: String, unique: true, required: true },
    paidAt: Date,
  },
  { timestamps: true }
);

const TransactionModel = model('Transaction', TransactionSchema);
export default TransactionModel;
