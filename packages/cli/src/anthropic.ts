
import Anthropic from "@anthropic-ai/sdk";
import { extractJson, heuristicReview, SYSTEM_PROMPT } from "./ai.ts";
import { buildPrompt } from "./scanner.ts";

export async function reviewBatch(files, apiKey) {
  if (!apiKey) return heuristicReview(files);
  const anthropic = new Anthropic({ apiKey });
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(files) }]
  });
  const message = await stream.finalMessage();
  const text = message.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
  return extractJson(text);
}
