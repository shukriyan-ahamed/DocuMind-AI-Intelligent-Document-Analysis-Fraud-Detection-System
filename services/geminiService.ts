import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, DocumentType, SimilarityResult } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const ANALYSIS_MODEL = "gemini-2.5-flash";

// Schema for structured analysis output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ocrText: { type: Type.STRING, description: "The full raw text extracted from the document." },
    summaryShort: { type: Type.STRING, description: "A one-sentence summary." },
    summaryMedium: { type: Type.STRING, description: "A paragraph summary." },
    summaryLong: { type: Type.STRING, description: "A detailed multi-paragraph summary." },
    documentType: { 
      type: Type.STRING, 
      enum: ["Resume", "Invoice", "Legal Document", "Medical Report", "Research Paper", "Receipt", "Other"],
      description: "The classification of the document."
    },
    confidenceScore: { type: Type.NUMBER, description: "Confidence in classification (0-1)." },
    fraudDetection: {
      type: Type.OBJECT,
      properties: {
        isSuspicious: { type: Type.BOOLEAN },
        score: { type: Type.NUMBER, description: "0-100 likelihood of being fake." },
        reasoning: { type: Type.STRING, description: "Why it might be fake (fonts, layout, etc)." }
      },
      required: ["isSuspicious", "score", "reasoning"]
    },
    entities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          category: { type: Type.STRING, description: "e.g., Name, Date, Price, Disease, Organization" }
        }
      }
    }
  },
  required: ["ocrText", "summaryShort", "summaryMedium", "summaryLong", "documentType", "confidenceScore", "fraudDetection", "entities"]
};

// Schema for similarity check
const similaritySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    similarityScore: { type: Type.NUMBER, description: "0-100 percentage similarity." },
    explanation: { type: Type.STRING },
    differences: { type: Type.ARRAY, items: { type: Type.STRING } },
    similarities: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["similarityScore", "explanation", "differences", "similarities"]
};

export const analyzeDocument = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this document comprehensively. 
            1. Extract all text (OCR).
            2. Provide Short, Medium, and Long summaries.
            3. Classify the document type.
            4. Detect any signs of digital tampering (mismatched fonts, weird artifacts, logical inconsistencies in numbers/dates).
            5. Extract key entities (Names, Prices, Dates, etc.).
            Return strict JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2 // Lower temperature for more analytical/factual results
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    
    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const compareDocuments = async (
  doc1: { base64: string, mimeType: string },
  doc2: { base64: string, mimeType: string }
): Promise<SimilarityResult> => {
  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            text: "Compare these two documents. Analyze their visual layout, text content, and semantic meaning. Provide a similarity score and list key differences and similarities."
          },
          {
            inlineData: { mimeType: doc1.mimeType, data: doc1.base64 }
          },
          {
            inlineData: { mimeType: doc2.mimeType, data: doc2.base64 }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: similaritySchema,
        temperature: 0.3
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text) as SimilarityResult;
  } catch (error) {
    console.error("Similarity Check Error:", error);
    throw error;
  }
};

// We return the chat session to allow the UI to keep state
export const createChatSession = (base64Data: string, mimeType: string) => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [
      {
        role: "user",
        parts: [
          {
            inlineData: { mimeType, data: base64Data }
          },
          {
            text: "I have uploaded this document. I will ask you questions about it. Answer based ONLY on the provided document."
          }
        ]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to answer questions about this document." }]
      }
    ]
  });
  return chat;
};
