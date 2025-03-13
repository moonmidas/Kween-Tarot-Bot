import { StreamingTextResponse } from 'ai';
import { experimental_buildGroqSchema, GroqSchema } from 'ai/groq';
import { experimental_buildAnthropicSchema, AnthropicSchema } from 'ai/anthropic';

/**
 * Call AI to generate a tarot reading
 * @param {string} question - The user's question
 * @returns {Promise<{card: string, orientation: string, interpretation: string}>}
 */
export async function callAI(question) {
  try {
    // Try Groq first
    return await callGroq(question);
  } catch (error) {
    console.error("Error calling Groq:", error);
    
    try {
      // Fall back to Claude if Groq fails
      return await callClaude(question);
    } catch (secondError) {
      console.error("Error calling Claude (fallback):", secondError);
      throw new Error("Failed to generate tarot reading with both AI providers");
    }
  }
}

/**
 * Define the response schema for structured tarot readings
 */
const tarotReadingSchema = {
  type: "object",
  properties: {
    card: {
      type: "string",
      description: "The name of the tarot card",
    },
    orientation: {
      type: "string",
      enum: ["upright", "reversed"],
      description: "The orientation of the card",
    },
    interpretation: {
      type: "string",
      description: "The interpretation of the card in the context of the question",
    },
  },
  required: ["card", "orientation", "interpretation"],
};

/**
 * Call Groq API to generate a tarot reading
 * @param {string} question - The user's question
 * @returns {Promise<{card: string, orientation: string, interpretation: string}>}
 */
async function callGroq(question) {
  // Set up Groq schema
  const schema = experimental_buildGroqSchema({
    tools: [{
      name: "tarot_reading",
      description: "Generate a tarot card reading",
      parameters: tarotReadingSchema,
    }],
  });

  // Define the system prompt
  const systemPrompt = `You are a skilled tarot reader using the Rider-Waite deck. 
  Randomly select one card from the 78-card Rider-Waite tarot deck and determine if it's upright or reversed.
  Based on that card, provide a short interpretation in the context of the user's question.
  Your response should be a structured JSON object with the card name, orientation, and interpretation.`;

  // Define retry settings
  const maxRetries = 3;
  let retries = 0;
  let lastError = null;

  // Try with retries
  while (retries < maxRetries) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Question for tarot reading: ${question}` }
          ],
          tools: schema.tools,
          tool_choice: { type: "function", function: { name: "tarot_reading" } },
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract tool call from response
      if (data.choices?.[0]?.message?.tool_calls?.[0]) {
        const toolCall = data.choices[0].message.tool_calls[0];
        const functionArgs = JSON.parse(toolCall.function.arguments);
        return functionArgs;
      } else {
        throw new Error("No tool call in Groq response");
      }
    } catch (error) {
      lastError = error;
      retries++;
      
      if (retries >= maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error("Failed to call Groq API");
}

/**
 * Call Claude API to generate a tarot reading
 * @param {string} question - The user's question
 * @returns {Promise<{card: string, orientation: string, interpretation: string}>}
 */
async function callClaude(question) {
  // Set up Claude schema
  const schema = experimental_buildAnthropicSchema({
    tools: [{
      name: "tarot_reading",
      description: "Generate a tarot card reading",
      parameters: tarotReadingSchema,
    }],
  });

  // Define the system prompt
  const systemPrompt = `You are a skilled tarot reader using the Rider-Waite deck. 
  Randomly select one card from the 78-card Rider-Waite tarot deck and determine if it's upright or reversed.
  Based on that card, provide a short interpretation in the context of the user's question.
  Your response should be a structured JSON object with the card name, orientation, and interpretation.`;

  // Define retry settings
  const maxRetries = 3;
  let retries = 0;
  let lastError = null;

  // Try with retries
  while (retries < maxRetries) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: 'user', content: `Question for tarot reading: ${question}` }
          ],
          tools: schema.tools,
          tool_choice: { type: "tool", name: "tarot_reading" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract tool call from response
      if (data.content?.[0]?.type === 'tool_use' && data.content[0].name === 'tarot_reading') {
        return data.content[0].input;
      } else {
        throw new Error("No tool call in Claude response");
      }
    } catch (error) {
      lastError = error;
      retries++;
      
      if (retries >= maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error("Failed to call Claude API");
} 