import mongoose from 'mongoose';

const chatbothistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
    },
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    product_id: {
      type: String,
    },
  },
  { timestamps: true }
);

const chatbothistories = mongoose.model(
  'chatbothistories',
  chatbothistorySchema
);

export default chatbothistories;
