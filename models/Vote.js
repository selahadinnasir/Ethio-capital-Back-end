import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  ideaId: { type: mongoose.Schema.Types.ObjectId, required: true },
  voterId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Vote', voteSchema);
