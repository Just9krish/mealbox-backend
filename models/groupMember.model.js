import mongoose from 'mongoose';
import { Schema } from './index.js';
const { Schema, Types } = mongoose;

const GroupMemberSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: 'Group' },
    userId: { type: Types.ObjectId, ref: 'User' },
    joinedAt: Date,
    leftAt: Date,
  },
  { timestamps: true }
);

const GroupMemberModel = mongoose.model('GroupMember', GroupMemberSchema);

export default GroupMemberModel;
