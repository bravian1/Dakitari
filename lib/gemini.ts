import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export const triageSchema = {
  type: Type.OBJECT,
  properties: {
    severity: { type: Type.STRING, enum: ["low", "medium", "critical"], description: "Triage severity level" },
    condition_en: { type: Type.STRING, description: "Likely condition in English" },
    condition_sw: { type: Type.STRING, description: "Likely condition in Swahili" },
    symptoms_en: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Matched symptoms in English" },
    symptoms_sw: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Matched symptoms in Swahili" },
    actions_en: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recommended actions for CHV in English" },
    actions_sw: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recommended actions for CHV in Swahili" },
    summary_en: { type: Type.STRING, description: "Natural spoken summary in English addressing the CHV" },
    summary_sw: { type: Type.STRING, description: "Natural spoken summary in Swahili addressing the CHV" },
  },
  required: ["severity", "condition_en", "condition_sw", "symptoms_en", "symptoms_sw", "actions_en", "actions_sw", "summary_en", "summary_sw"]
};

export async function getTriageResult(transcript: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Patient symptoms reported by CHV: "${transcript}"`,
    config: {
      systemInstruction: `You are an expert clinical triage assistant for Community Health Volunteers (CHVs) in rural Kenya. 
Your job is to analyze the reported symptoms and provide a structured triage result.
Be medically cautious — always recommend professional follow-up for medium and critical cases. 
Common conditions in rural Kenya include malaria, pneumonia, diarrheal diseases, malnutrition, typhoid, respiratory infections, and measles.
The summary should be a natural paragraph that can be read aloud to the CHV, addressing them directly (e.g., "Based on what you've described...").
Provide all text fields in both English and Swahili.`,
      responseMimeType: "application/json",
      responseSchema: triageSchema,
      temperature: 0.2,
    }
  });

  if (!response.text) {
      throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text);
}

export async function generateSpeech(text: string, voiceName: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}
