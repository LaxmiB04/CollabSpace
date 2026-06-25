import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    attachments: [
      {
        url: { type: String },
        type: { type: String },
      },
    ],
    reactions: [
      {
        emoji: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isPinned: {
    type: Boolean,
    default: false,
},
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;