import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get a user's usage count for a specific date
export const get = query({
  args: { 
    user_id: v.string(),
    date: v.string() 
  },
  handler: async (ctx, args) => {
    const { user_id, date } = args;
    
    // Find the usage record for this user and date
    const usage = await ctx.db
      .query("user_usage")
      .withIndex("by_user_date", (q) => q.eq("user_id", user_id).eq("date", date))
      .first();
    
    return usage ? usage : { count: 0 };
  },
});

// Increment a user's usage count for a specific date
export const increment = mutation({
  args: { 
    user_id: v.string(),
    date: v.string() 
  },
  handler: async (ctx, args) => {
    const { user_id, date } = args;
    
    // Find the usage record for this user and date
    const usage = await ctx.db
      .query("user_usage")
      .withIndex("by_user_date", (q) => q.eq("user_id", user_id).eq("date", date))
      .first();
    
    if (usage) {
      // Increment the existing usage count
      await ctx.db.patch(usage._id, { count: usage.count + 1 });
      return { count: usage.count + 1 };
    } else {
      // Create a new usage record with count 1
      const id = await ctx.db.insert("user_usage", { 
        user_id, 
        date, 
        count: 1 
      });
      return { count: 1 };
    }
  },
}); 