import { ConvexHttpClient } from 'convex/browser';
import fetch from 'node-fetch'; // For making HTTP requests to Telegram API

// Initialize Convex client with environment variable
const convex = new ConvexHttpClient(process.env.CONVEX_URL);
// Telegram API endpoint using bot token from environment variables
const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

/**
 * Handles incoming Telegram webhook requests
 * @param {Object} req - Next.js API request object
 * @param {Object} res - Next.js API response object
 */
export default async function handler(req, res) {
  try {
    const update = req.body;
    const chatId = update.message.chat.id;
    const text = update.message.text;

    if (text.startsWith('/reading')) {
      try {
        // Attempt to retrieve bot state from Convex
        const state = await convex.query('botState:get', { chatId });
        if (!state) {
          throw new Error('Bot state not found');
        }

        // Generate photo URL based on bot state
        const photoUrl = generatePhotoUrl(state);
        // Validate the photo URL before sending
        if (!isValidHttpUrl(photoUrl)) {
          throw new Error('Invalid photo URL');
        }

        // Send the photo to the Telegram user
        await sendPhoto(chatId, photoUrl);
      } catch (error) {
        // Log the error and inform the user
        console.error('Error processing /reading command:', error);
        await sendMessage(chatId, 'Sorry, there was an error processing your request. Please try again later.');
      }
    }

    // Respond to Telegram to acknowledge receipt
    res.status(200).send('OK');
  } catch (error) {
    // Handle unexpected errors in the webhook
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
}

/**
 * Sends a photo to a Telegram chat
 * @param {number} chatId - The Telegram chat ID
 * @param {string} photoUrl - The URL of the photo to send
 */
async function sendPhoto(chatId, photoUrl) {
  const url = `${TELEGRAM_API_URL}/sendPhoto?chat_id=${chatId}&photo=${encodeURIComponent(photoUrl)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Failed to send photo: ${data.description}`);
  }
}

/**
 * Sends a text message to a Telegram chat
 * @param {number} chatId - The Telegram chat ID
 * @param {string} text - The message text
 */
async function sendMessage(chatId, text) {
  const url = `${TELEGRAM_API_URL}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Failed to send message: ${data.description}`);
  }
}

/**
 * Generates a photo URL based on the bot state
 * @param {Object} state - The bot state retrieved from Convex
 * @returns {string} - The generated photo URL
 */
function generatePhotoUrl(state) {
  // Placeholder implementation; replace with actual logic
  // Assumes state has a photoUrl property
  return state.photoUrl || 'https://example.com/default-photo.jpg';
}

/**
 * Validates if a string is a valid HTTP/HTTPS URL
 * @param {string} string - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}