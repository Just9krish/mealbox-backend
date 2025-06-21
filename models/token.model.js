import { Schema, Types, model } from 'mongoose';

const PasswordResetSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: 'User' },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PasswordResetModel = model('PasswordReset', PasswordResetSchema);
export default PasswordResetModel;
