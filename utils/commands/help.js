import { sendMessage } from "../telegram";

export async function helpCommand(chatId){
    let msg= `The following commands are available:

/start - Start the bot

/help - Get help from the bot

/reading <question> - Get a tarot card reading for your question

/togglebot - Enable or disable the bot (admin only)
`
    await sendMessage(chatId, msg)
}