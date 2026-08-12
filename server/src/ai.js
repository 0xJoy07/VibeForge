import OpenAI from "openai";
import { extractJson, SYSTEM_PROMPT } from "./analysis.js";

export async function reviewPrompt(content, apiKey) {
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");
  
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "VibeForge",
    }
  });

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "openrouter/free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: content }
        ],
        temperature: 0.1, // slightly higher to avoid deterministic bad loops
        max_tokens: 2000,
      });

      const text = response.choices[0]?.message?.content || "";
      return extractJson(text);
    } catch (error) {
      console.error(`[AI attempt ${attempt}] failed:`, error.message);
      lastError = error;
    }
  }
  
  throw new Error(`AI Request failed after 3 attempts: ${lastError.message}`);
}
