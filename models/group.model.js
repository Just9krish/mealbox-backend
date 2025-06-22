import { Schema, Types, model } from 'mongoose';
import { GROUP_STATUS, ORDER_MODE } from '../constant.js';

const GroupSchema = new Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    qrToken: { type: String, unique: true },
    status: {
      type: String,
      enum: Object.values(GROUP_STATUS),
      default: GROUP_STATUS.UPCOMING,
    },
    mode: {
      type: String,
      enum: Object.values(ORDER_MODE),
      required: true,
    },
  },
  { timestamps: true }
);

const GroupModel = model('Group', GroupSchema);
export default GroupModel;
