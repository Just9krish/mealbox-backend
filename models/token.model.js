import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const PasswordResetSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: 'User' },
    token: String,
    expiresAt: Date,
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PasswordResetModel = mongoose.model('PasswordReset', PasswordResetSchema);

export default PasswordResetModel;
