import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current bot state
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    // Get the first bot_state record
    const botState = await ctx.db.query("bot_state").first();
    
    // If no bot state found, assume enabled by default
    return botState ? botState : { enabled: true };
  },
});

/**
 * Toggle the bot state (enable/disable)
 */
export const toggle = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the first bot_state record
    const botState = await ctx.db.query("bot_state").first();
    
    if (botState) {
      // Toggle the existing bot state
      await ctx.db.patch(botState._id, { enabled: !botState.enabled });
      return { enabled: !botState.enabled };
    } else {
      // Create a new bot state record (initially disabled since we're toggling from default enabled)
      const id = await ctx.db.insert("bot_state", { enabled: false });
      return { enabled: false };
    }
  },
});