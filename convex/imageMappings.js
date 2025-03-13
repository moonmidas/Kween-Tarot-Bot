import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get a file ID for a specific card and orientation
export const getFileId = query({
  args: { 
    card: v.string(),
    orientation: v.string() 
  },
  handler: async (ctx, args) => {
    const { card, orientation } = args;
    
    // Get the first image_mappings record
    const mappingsRecord = await ctx.db
      .query("image_mappings")
      .first();
    
    if (!mappingsRecord || !mappingsRecord.mappings) {
      return null;
    }
    
    // Get the mapping for this card
    const cardMapping = mappingsRecord.mappings[card];
    
    if (!cardMapping || !cardMapping[orientation]) {
      return null;
    }
    
    return cardMapping[orientation];
  },
});

// Set a file ID for a specific card and orientation
export const setFileId = mutation({
  args: { 
    card: v.string(),
    orientation: v.string(),
    fileId: v.string() 
  },
  handler: async (ctx, args) => {
    const { card, orientation, fileId } = args;
    
    // Get the first image_mappings record
    const mappingsRecord = await ctx.db
      .query("image_mappings")
      .first();
    
    if (mappingsRecord) {
      // Create a new mappings object based on the existing one
      const newMappings = { ...mappingsRecord.mappings };
      
      // Update the mapping for this card
      if (!newMappings[card]) {
        newMappings[card] = {};
      }
      newMappings[card][orientation] = fileId;
      
      // Update the record
      await ctx.db.patch(mappingsRecord._id, { mappings: newMappings });
    } else {
      // Create a new mappings record
      const newMappings = {};
      newMappings[card] = {};
      newMappings[card][orientation] = fileId;
      
      await ctx.db.insert("image_mappings", { mappings: newMappings });
    }
    
    return fileId;
  },
}); 