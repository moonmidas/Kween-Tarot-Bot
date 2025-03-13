/**
 * Script to upload tarot card images to Telegram and store file IDs in Convex
 * 
 * Usage: node scripts/uploadImages.js <base_url>
 * Example: node scripts/uploadImages.js https://example.com/tarot-images/
 * 
 * Image naming convention: <Card_Name>_<Orientation>.jpg
 * Example: The_Sun_Upright.jpg, The_Sun_Reversed.jpg
 */

const { uploadPhoto } = require('../utils/telegram');
const { setImageFileId } = require('../utils/database');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Get the base URL from command line arguments
const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error('Please provide a base URL for the images');
  console.error('Usage: node scripts/uploadImages.js <base_url>');
  process.exit(1);
}

// Load general meanings to get card names
const generalMeaningsPath = path.join(process.cwd(), 'data', 'generalMeanings.json');
let generalMeanings = {};

try {
  const data = fs.readFileSync(generalMeaningsPath, 'utf8');
  generalMeanings = JSON.parse(data);
} catch (error) {
  console.error("Error loading general meanings:", error);
  process.exit(1);
}

// Function to upload an image and store its file ID
async function uploadAndStoreImage(card, orientation) {
  try {
    // Format the image URL
    const imageName = `${card.replace(/ /g, '_')}_${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.jpg`;
    const imageUrl = `${baseUrl}${imageName}`;
    
    console.log(`Uploading ${imageName}...`);
    
    // Upload the image to Telegram
    const fileId = await uploadPhoto(imageUrl);
    
    console.log(`Uploaded ${imageName}, file ID: ${fileId}`);
    
    // Store the file ID in Convex
    await setImageFileId(card, orientation.toLowerCase(), fileId);
    
    console.log(`Stored file ID for ${card} (${orientation})`);
    
    return true;
  } catch (error) {
    console.error(`Error uploading ${card} (${orientation}):`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting image upload process...');
  
  let successCount = 0;
  let failureCount = 0;
  
  // Process each card in the general meanings
  for (const card in generalMeanings) {
    // Upload upright image
    const uprightSuccess = await uploadAndStoreImage(card, 'upright');
    if (uprightSuccess) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Upload reversed image
    const reversedSuccess = await uploadAndStoreImage(card, 'reversed');
    if (reversedSuccess) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Image upload process completed');
  console.log(`Successfully uploaded and stored ${successCount} images`);
  console.log(`Failed to upload ${failureCount} images`);
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
}); 