import mongoose from 'mongoose';

const chatbothistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    product_id: {
      type: String,
    },
    // Force a single timestamp field used for sorting
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const ChatbotHistory = mongoose.model('ChatbotHistory', chatbothistorySchema);

export default ChatbotHistory;
