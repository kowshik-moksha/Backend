// src/controllers/chatHistoryController.js
import ChatbotHistory from '../../models/Chatbothistory.js';

// Get chatbot history by user ID
export const getChatHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }

    const history = await ChatbotHistory.find({ user_id: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
