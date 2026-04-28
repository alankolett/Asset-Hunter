import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ThreatAnalysisResponse {
  is_unauthorized: boolean;
  threat_level: "CRITICAL" | "ELEVATED" | "LOW";
  confidence_score: number;
  primary_indicator: string;
  detailed_reasoning: string;
}

const SYSTEM_INSTRUCTION = `You are 'Asset-Hunter', an advanced Digital Rights Threat Intelligence Engine. Your primary directive is to analyze web-scraped media (images/video thumbnails) and their surrounding text metadata to detect the unauthorized distribution, piracy, or misappropriation of proprietary sports media.

EVALUATION CRITERIA (Threat Vectors):
1. VISUAL ANOMALIES: Detect unauthorized overlays. Look for betting sponsors (e.g., 1XBET, Stake), cryptocurrency casino logos, "Live" badges that don't match official network graphics, or evidence of screen-recording (visible cursors, mobile UI elements, browser tabs).
2. LINGUISTIC INTENT: Analyze the text for piracy lexicon. Flag phrases like "link in bio," "free stream," "backup account," "watch live 1080p," or attempts to evade spam filters (e.g., "$tream", "L!ve").
3. SOURCE VERIFICATION: Determine if the context suggests an official source (e.g., ESPN, Formula 1, official team accounts) versus a highly suspicious aggregator or burner account.

FALSE POSITIVE MITIGATION (CRITICAL):
Do NOT flag the asset as a threat if:
- It is a standard meme using a sports template.
- It is a legitimate news article, blog, or sports commentary piece.
- It is clearly an official promotional post by a verified organization.`;

export async function analyzeAsset(
  textMetadata: string,
  base64Image?: { mimeType: string; data: string }
): Promise<ThreatAnalysisResponse> {
  const parts: any[] = [];
  
  if (textMetadata.trim()) {
    parts.push({ text: `Text Metadata: ${textMetadata}` });
  } else {
    parts.push({ text: "Text Metadata: (None provided)" });
  }

  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: base64Image.mimeType,
        data: base64Image.data,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_unauthorized: {
            type: Type.BOOLEAN,
            description: "Whether the asset is deemed unauthorized/pirated.",
          },
          threat_level: {
            type: Type.STRING,
            description: "The threat level assessed.",
            enum: ["CRITICAL", "ELEVATED", "LOW"]
          },
          confidence_score: {
            type: Type.INTEGER,
            description: "Confidence from 0 to 100",
          },
          primary_indicator: {
            type: Type.STRING,
            description: "1-2 words summarizing the main red flag",
          },
          detailed_reasoning: {
            type: Type.STRING,
            description: "Concise, technical sentence explaining the verdict.",
          },
        },
        required: [
          "is_unauthorized",
          "threat_level",
          "confidence_score",
          "primary_indicator",
          "detailed_reasoning",
        ],
      },
    },
  });

  const rawJson = response.text || "{}";
  try {
    return JSON.parse(rawJson) as ThreatAnalysisResponse;
  } catch (err) {
    console.error("Failed to parse GenAI response JSON", err);
    throw new Error("Failed to parse GenAI response.");
  }
}
