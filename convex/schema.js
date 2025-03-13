import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Bot state table to track if the bot is enabled or disabled
  bot_state: defineTable({
    enabled: v.boolean(),
  }),
  
  // User usage table to track daily usage for rate limiting
  user_usage: defineTable({
    user_id: v.string(),
    date: v.string(),
    count: v.number(),
  }).index("by_user_date", ["user_id", "date"]),
  
  // Image mappings table to store Telegram file IDs for card images
  image_mappings: defineTable({
    mappings: v.object(v.string(), v.object(v.string(), v.string())),
  }),
}); 