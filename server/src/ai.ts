import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT, type ScanResult } from "./analysis.js";

const ScanResultSchema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        security: { type: Type.INTEGER },
        aiSlop: { type: Type.INTEGER },
        codeQuality: { type: Type.INTEGER },
        performance: { type: Type.INTEGER },
        structure: { type: Type.INTEGER },
      },
      required: ["security", "aiSlop", "codeQuality", "performance", "structure"],
    },
    grade: { type: Type.STRING, enum: ["A", "B", "C", "D", "F"] },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          file: { type: Type.STRING },
          line: { type: Type.INTEGER, nullable: true },
          lineEnd: { type: Type.INTEGER, nullable: true },
          severity: { type: Type.STRING, enum: ["critical", "warning", "info"] },
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          fix: { type: Type.STRING },
        },
        required: ["file", "line", "lineEnd", "severity", "category", "title", "description", "fix"],
      },
    },
    summary: { type: Type.STRING },
  },
  required: ["scores", "grade", "issues", "summary"],
};

export async function reviewPrompt(content: string, apiKey: string): Promise<ScanResult> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: content }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: ScanResultSchema,
      temperature: 0.1,
    }
  });

  if (!response.text) {
    throw new Error("Empty response from Gemini.");
  }

  return JSON.parse(response.text) as ScanResult;
}
