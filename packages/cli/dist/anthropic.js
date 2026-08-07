import Groq from "groq-sdk";
import { extractJson, heuristicReview, SYSTEM_PROMPT } from "./ai.ts";
import { buildPrompt } from "./scanner.ts";
export async function reviewBatch(files, apiKey) {
    if (!apiKey)
        return heuristicReview(files);
    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4096,
        temperature: 0,
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildPrompt(files) }
        ]
    });
    const text = response.choices[0]?.message?.content ?? "";
    return extractJson(text);
}
