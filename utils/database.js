import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Get the current bot state
 * @returns {Promise<{enabled: boolean}>}
 */
export async function getBotState() {
  try {
    return await convex.query("botState:get");
  } catch (error) {
    console.error("Error getting bot state:", error);
    // Default to enabled if there's an error
    return { enabled: true };
  }
}

/**
 * Toggle the bot state (enable/disable)
 * @returns {Promise<{enabled: boolean}>}
 */
export async function toggleBotState() {
  try {
    return await convex.mutation("botState:toggle");
  } catch (error) {
    console.error("Error toggling bot state:", error);
    throw error;
  }
}

/**
 * Get a user's usage count for a specific date
 * @param {string} userId - The Telegram user ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Promise<{count: number}>}
 */
export async function getUserUsage(userId, date) {
  try {
    return await convex.query("userUsage:get", {
      user_id: userId,
      date: date,
    });
  } catch (error) {
    console.error("Error getting user usage:", error);
    // Default to 0 if there's an error
    return { count: 0 };
  }
}

/**
 * Increment a user's usage count for a specific date
 * @param {string} userId - The Telegram user ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Promise<{count: number}>}
 */
export async function incrementUserUsage(userId, date) {
  try {
    return await convex.mutation("userUsage:increment", {
      user_id: userId,
      date: date,
    });
  } catch (error) {
    console.error("Error incrementing user usage:", error);
    throw error;
  }
}

/**
 * Get a file ID for a specific card and orientation
 * @param {string} card - The tarot card name
 * @param {string} orientation - The card orientation ("upright" or "reversed")
 * @returns {Promise<string|null>}
 */
export async function getImageFileId(card, orientation) {
  try {
    return await convex.query("imageMappings:getFileId", {
      card: card,
      orientation: orientation,
    });
  } catch (error) {
    console.error("Error getting image file ID:", error);
    return null;
  }
}

/**
 * Set a file ID for a specific card and orientation
 * @param {string} card - The tarot card name
 * @param {string} orientation - The card orientation ("upright" or "reversed")
 * @param {string} fileId - The Telegram file ID
 * @returns {Promise<string>}
 */
export async function setImageFileId(card, orientation, fileId) {
  try {
    return await convex.mutation("imageMappings:setFileId", {
      card: card,
      orientation: orientation,
      fileId: fileId,
    });
  } catch (error) {
    console.error("Error setting image file ID:", error);
    throw error;
  }
} 