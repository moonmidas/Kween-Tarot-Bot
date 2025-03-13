import { sendMessage } from "../telegram";
import { isAdmin } from "../telegram";
import { getBotState, toggleBotState } from "../database";

/**
 * Handle the /togglebot command
 * @param {string} chatId - The Telegram chat ID
 * @param {string} userId - The Telegram user ID
 * @returns {Promise<void>}
 */
export async function toggleBotCommand(chatId, userId) {
  try {
    // Check if the user is an admin
    const adminStatus = await isAdmin(chatId, userId);
    
    if (!adminStatus) {
      await sendMessage(chatId, "Only admins can use this command.");
      return;
    }
    
    // Toggle the bot state
    const newState = await toggleBotState();
    
    // Send a confirmation message
    const message = newState.enabled 
      ? "Bot is now enabled." 
      : "Bot is now disabled.";
    
    await sendMessage(chatId, message);
  } catch (error) {
    console.error("Error in togglebot command:", error);
    await sendMessage(chatId, "An error occurred while toggling the bot state. Please try again later.");
  }
} 