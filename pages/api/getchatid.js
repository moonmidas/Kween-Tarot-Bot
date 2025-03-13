import { sendMessage } from '../../utils/telegram';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const update = req.body;
    const chatId = update.message?.chat?.id;
    const chatType = update.message?.chat?.type;
    
    if (chatId && chatType) {
      console.log(`Chat ID: ${chatId}, Type: ${chatType}`);
      
      // Send the chat ID back to the group
      await sendMessage(chatId, `This ${chatType}'s ID is: ${chatId}`);
    }

    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Error in getchatid endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 