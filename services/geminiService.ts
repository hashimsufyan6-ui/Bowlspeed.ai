import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, VideoResolution } from "../types";

const SYSTEM_INSTRUCTION = `
You are a Professional Cricket Coach specializing in Biomechanics.
Your task is to analyze bowling TECHNIQUE only. 
Do not calculate speed. The user calculates speed manually.
Focus on:
1. Run-up momentum.
2. Jump and gathering.
3. Arm position (high arm, round arm, sling).
4. Follow through.
5. Injury risks (mixed actions).

Provide a concise summary and 3 actionable tips.
`;

export const analyzeVideo = async (
  base64Video: string,
  mimeType: string,
  fps: number,
  resolution: VideoResolution
): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Analyze the bowling technique in this video.
      Video FPS: ${fps}.
      Provide constructive feedback for a cricket player.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Video,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            techniqueAnalysis: { type: Type.STRING, description: "Detailed analysis of biomechanics (max 50 words)" },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 specific tips"
            }
          },
          required: ["techniqueAnalysis", "recommendations"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    // We only need the qualitative parts now
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};