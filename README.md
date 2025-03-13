# Kween Tarot Bot

A Telegram bot designed exclusively for a specific community group, providing single-card tarot readings using the Rider-Waite deck, including both upright and reversed card interpretations.

## Features

- Single-card tarot readings with the Rider-Waite deck
- AI-generated interpretations specific to user questions
- Admin controls to enable/disable the bot
- Rate limiting for non-admin users (3 readings per day)
- Responses include card image, general meaning, and question-specific interpretation

## Tech Stack

- Next.js for the serverless API
- Telegram Bot API for messaging
- Groq API (with Claude fallback) for AI-generated readings
- Convex for database storage
- Vercel for hosting

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/Kween-Tarot-Bot.git
   cd Kween-Tarot-Bot
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up Convex**:
   ```
   npx convex dev --once --configure=new
   ```
   Follow the prompts to create a new Convex project.

4. **Configure environment variables**:
   - Copy `.env.sample` to `.env.local`:
     ```
     cp .env.sample .env.local
     ```
   - Edit `.env.local` and add your API keys and settings:
     - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from BotFather
     - `TELEGRAM_SECRET_TOKEN`: A secret token for webhook security
     - `DESIGNATED_CHAT_ID`: The chat ID of your Telegram group
     - `BOT_CHAT_ID`: Your bot's own chat ID (for uploading images)
     - `GROQ_API_KEY`: Your Groq API key
     - `CLAUDE_API_KEY`: Your Claude API key

5. **Upload tarot card images**:
   - Upload all 156 tarot card images (e.g., "The_Sun_Upright.jpg") to a public URL
   - Run the upload script:
     ```
     node scripts/uploadImages.js https://your-image-url-base/
     ```

6. **Deploy to Vercel**:
   ```
   vercel
   ```

7. **Set up the Telegram webhook**:
   - Make a POST request to:
     ```
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-vercel-url.vercel.app/api/webhook&secret_token=<YOUR_SECRET_TOKEN>
     ```

## Usage

The bot responds to the following commands:

- `/start` or `/help` - Get help and list available commands
- `/reading <question>` - Get a tarot card reading for your question
- `/togglebot` - Enable or disable the bot (admin only)

## Development

To run the bot locally:

1. Start the Next.js development server:
   ```
   npm run dev
   ```

2. Use a tool like ngrok to expose your local server:
   ```
   ngrok http 3000
   ```

3. Set the Telegram webhook to your ngrok URL:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok.io/api/webhook&secret_token=<YOUR_SECRET_TOKEN>
   ```

## License

MIT