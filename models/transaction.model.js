const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const TransactionSchema = new Schema(
  {
    order_id: { type: Types.ObjectId, ref: 'Order', unique: true },
    method: { type: String, enum: PAYMENT_METHOD },
    status: { type: String, enum: PAYMENT_STATUS, default: 'UNPAID' },
    amount: Number,
    transaction_ref: { type: String, unique: true },
    paid_at: Date,
  },
  { timestamps: true }
);

const TransactionModel = mongoose.model('Transaction', TransactionSchema);

module.exports = TransactionModel;
