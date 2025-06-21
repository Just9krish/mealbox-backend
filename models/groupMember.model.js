import { Schema, Types, model } from 'mongoose';

const GroupMemberSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: 'Group', required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, required: true },
    leftAt: { type: Date },
  },
  { timestamps: true }
);

const GroupMemberModel = model('GroupMember', GroupMemberSchema);
export default GroupMemberModel;
