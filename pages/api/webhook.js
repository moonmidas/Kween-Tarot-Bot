// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { helpCommand } from "@/utils/commands/help";
import { toggleBotCommand } from "@/utils/commands/togglebot";
import { readingCommand } from "@/utils/commands/reading";
import { sendMessage } from "@/utils/telegram";

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // Verify the request method
  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST']);
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Verify the secret token if provided
  const secretToken = req.headers['x-telegram-bot-api-secret-token'];
  if (process.env.TELEGRAM_SECRET_TOKEN && secretToken !== process.env.TELEGRAM_SECRET_TOKEN) {
    console.error("Invalid secret token");
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    // Extract message data
    const chatId = req.body.message?.chat?.id;
    const userId = req.body.message?.from?.id;
    const text = req.body.message?.text || '';

    // Check if this is the designated chat
    if (process.env.DESIGNATED_CHAT_ID && chatId !== process.env.DESIGNATED_CHAT_ID) {
      console.log(`Ignoring message from non-designated chat: ${chatId}`);
      res.status(200).send("OK");
      return;
    }

    console.log("ChatID:", chatId);
    console.log("UserID:", userId);
    console.log("Text:", text);

    // Handle commands
    if (text.startsWith("/start") || text.startsWith("/help")) {
      await helpCommand(chatId);
    } else if (text.startsWith("/togglebot")) {
      await toggleBotCommand(chatId, userId);
    } else if (text.startsWith("/reading")) {
      await readingCommand(chatId, userId, text);
    } else {
      // For any other message, respond with help
      await helpCommand(chatId);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
}
