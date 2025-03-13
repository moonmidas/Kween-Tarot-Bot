// Telegram API utilities
const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

/**
 * Send a text message to a Telegram chat
 * @param {string} chatid - The Telegram chat ID
 * @param {string} text - The message text
 * @param {object} [options] - Additional options like parse_mode
 * @returns {Promise<void>}
 */
export async function sendMessage(chatid, text, options = {}) {
    const url = `${TELEGRAM_API_URL}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatid,
                text: text,
                ...options
            })
        })
        if (!response.ok){
            console.error("Failed to send message to Telegram user", await response.text());
        }
    } catch (err) {
        console.error("Error occurred while sending message to Telegram user", err);
    }
}

/**
 * Send a photo with caption to a Telegram chat
 * @param {string} chatid - The Telegram chat ID
 * @param {string} fileId - The Telegram file ID of the photo
 * @param {string} caption - The caption text
 * @returns {Promise<void>}
 */
export async function sendPhoto(chatid, fileId, caption) {
    const url = `${TELEGRAM_API_URL}/sendPhoto`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatid,
                photo: fileId,
                caption: caption,
                parse_mode: "Markdown"
            })
        });
        
        if (!response.ok){
            console.error("Failed to send photo to Telegram user", await response.text());
        }
    } catch (err) {
        console.error("Error occurred while sending photo to Telegram user", err);
    }
}

/**
 * Check if a user is an admin in a chat
 * @param {string} chatId - The Telegram chat ID
 * @param {string} userId - The Telegram user ID
 * @returns {Promise<boolean>}
 */
export async function isAdmin(chatId, userId) {
    const url = `${TELEGRAM_API_URL}/getChatMember`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                user_id: userId
            })
        });
        
        if (!response.ok) {
            console.error("Failed to get chat member", await response.text());
            return false;
        }
        
        const data = await response.json();
        
        if (!data.ok) {
            return false;
        }
        
        // Check if the user is an admin or the creator
        const status = data.result.status;
        return status === "administrator" || status === "creator";
    } catch (err) {
        console.error("Error occurred while checking admin status", err);
        return false;
    }
}

/**
 * Upload a photo to Telegram and get the file ID
 * @param {string} url - The URL of the photo to upload
 * @returns {Promise<string>} - The Telegram file ID
 */
export async function uploadPhoto(url) {
    // We'll use the bot's own chat ID to upload the photo
    const chatId = process.env.BOT_CHAT_ID;
    const telegramUrl = `${TELEGRAM_API_URL}/sendPhoto`;
    
    try {
        const response = await fetch(telegramUrl, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                photo: url
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to upload photo: ${await response.text()}`);
        }
        
        const data = await response.json();
        
        if (!data.ok) {
            throw new Error("Telegram API returned an error");
        }
        
        // Extract the file ID from the response
        return data.result.photo[0].file_id;
    } catch (err) {
        console.error("Error occurred while uploading photo", err);
        throw err;
    }
}

/**
 * Send a photo from a local file path with caption to a Telegram chat
 * @param {string} chatid - The Telegram chat ID
 * @param {string} filePath - The local file path relative to public directory
 * @param {string} caption - The caption text
 * @returns {Promise<void>}
 */
export async function sendLocalPhoto(chatid, filePath, caption) {
    const url = `${TELEGRAM_API_URL}/sendPhoto`;
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${filePath}`;
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatid,
                photo: fullUrl,
                caption: caption,
                parse_mode: "Markdown"
            })
        });
        
        if (!response.ok){
            console.error("Failed to send photo to Telegram user", await response.text());
            // Fallback to text-only response if image fails
            await sendMessage(chatid, caption, { parse_mode: "Markdown" });
        }
    } catch (err) {
        console.error("Error occurred while sending photo to Telegram user", err);
        // Fallback to text-only response if image fails
        await sendMessage(chatid, caption, { parse_mode: "Markdown" });
    }
}