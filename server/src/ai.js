import Anthropic from "@anthropic-ai/sdk";
import { extractJson, SYSTEM_PROMPT } from "./analysis.js";

export async function reviewPrompt(content, apiKey) {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");
  const anthropic = new Anthropic({ apiKey });
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }]
  });
  const message = await stream.finalMessage();
  const text = message.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
  return extractJson(text);
}
