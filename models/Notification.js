// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, // admin
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessIdea',
      required: true,
    },
    message: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
