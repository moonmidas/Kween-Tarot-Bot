import { sendMessage, sendLocalPhoto, isAdmin } from "../telegram";
import { getBotState } from "../database";
import { getUserUsage, incrementUserUsage } from "../database";
import { callAI } from "../ai";
import fs from 'fs';
import path from 'path';

// Load general meanings from JSON file
const generalMeaningsPath = path.join(process.cwd(), 'data', 'generalMeanings.json');
let generalMeanings = {};

try {
  const data = fs.readFileSync(generalMeaningsPath, 'utf8');
  generalMeanings = JSON.parse(data);
} catch (error) {
  console.error("Error loading general meanings:", error);
}

/**
 * Get the image path for a card and orientation
 * @param {string} card - The card name
 * @param {string} orientation - The card orientation
 * @returns {string} - The image path relative to public directory
 */
function getImagePath(card, orientation) {
  const imageName = `${card.replace(/ /g, '_')}_${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.jpg`;
  return `tarot-images/${imageName}`;
}

/**
 * Handle the /reading command
 * @param {string} chatId - The Telegram chat ID
 * @param {string} userId - The Telegram user ID
 * @param {string} text - The full command text
 * @returns {Promise<void>}
 */
export async function readingCommand(chatId, userId, text) {
  try {
    // Extract the question from the command
    const question = text.replace(/^\/reading\s*/, '').trim();
    
    if (!question) {
      await sendMessage(chatId, "Please provide a question for your reading. Example: /reading Will I succeed?");
      return;
    }
    
    // Check if the bot is enabled
    const botState = await getBotState();
    if (!botState.enabled) {
      await sendMessage(chatId, "The bot is currently disabled by an admin.");
      return;
    }
    
    // Check if the user is an admin
    const adminStatus = await isAdmin(chatId, userId);
    
    // If not an admin, check rate limits
    if (!adminStatus) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Get user's usage for today
      const usage = await getUserUsage(userId.toString(), today);
      
      if (usage.count >= 3) {
        await sendMessage(chatId, "You have reached your daily limit of 3 readings. Please try again tomorrow.");
        return;
      }
    }
    
    // Send a "processing" message
    await sendMessage(chatId, "Shuffling the deck and drawing a card for you...");
    
    // Call AI to generate a reading
    const reading = await callAI(question);
    
    // Validate the card and orientation
    if (!reading || !reading.card || !reading.orientation || !reading.interpretation) {
      await sendMessage(chatId, "An error occurred while generating your reading. Please try again.");
      return;
    }
    
    // Get the general meaning for this card and orientation
    const generalMeaning = generalMeanings[reading.card]?.[reading.orientation];
    
    if (!generalMeaning) {
      console.error(`No general meaning found for ${reading.card} (${reading.orientation})`);
      await sendMessage(chatId, "An error occurred while generating your reading. Please try again.");
      return;
    }
    
    // Get the image path for this card and orientation
    const imagePath = getImagePath(reading.card, reading.orientation);
    
    // Format the caption
    const caption = `**${reading.card} (${reading.orientation})**\n*General Meaning: ${generalMeaning}*\n*Interpretation: ${reading.interpretation}*`;
    
    // Send the photo with caption
    await sendLocalPhoto(chatId, imagePath, caption);
    
    // If not an admin, increment usage count
    if (!adminStatus) {
      const today = new Date().toISOString().split('T')[0];
      await incrementUserUsage(userId.toString(), today);
    }
  } catch (error) {
    console.error("Error in reading command:", error);
    await sendMessage(chatId, "The service is unavailable at the moment. Please try again later.");
  }
} 