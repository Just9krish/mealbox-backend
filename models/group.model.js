import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const GroupSchema = new Schema(
  {
    name: String,
    createdBy: { type: Types.ObjectId, ref: 'User' },
    scheduledAt: Date,
    qrToken: { type: String, unique: true },
    status: { type: String, enum: GROUP_STATUS, default: 'UPCOMING' },
    mode: { type: String, enum: ORDER_MODE, default: 'DINE_IN' },
  },
  { timestamps: true }
);

const GroupModel = mongoose.model('Group', GroupSchema);

export default GroupModel;
