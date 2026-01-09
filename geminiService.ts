
import { GoogleGenAI, Type } from "@google/genai";
import { UsernameInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function findAvailableUsernames(keyword: string): Promise<UsernameInfo[]> {
  const prompt = `
    أنت خبير في ابتكار يوزرات (أسماء مستخدمين) مميزة ومتاحة لمنصات التواصل الاجتماعي.
    بناءً على الكلمة المفتاحية "${keyword}"، قم بتوليد 15 يوزر إبداعياً.
    الشروط:
    - طول اليوزر بين 3 و 7 أحرف.
    - يحتوي على أحرف، أرقام، أو شرطة سفلية.
    - لكل يوزر، قم بتقدير احتمالية توفره على المنصات التالية (Instagram, TikTok, X, Snapchat, YouTube).
    - كن واقعياً: اليوزرات القصيرة جداً (3-4 أحرف) نادراً ما تكون متاحة على المنصات الكبيرة.
    - أعد النتيجة ككائن JSON يحتوي على مصفوفة "results".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  availability: {
                    type: Type.OBJECT,
                    properties: {
                      instagram: { type: Type.BOOLEAN },
                      tiktok: { type: Type.BOOLEAN },
                      x: { type: Type.BOOLEAN },
                      snapchat: { type: Type.BOOLEAN },
                      youtube: { type: Type.BOOLEAN }
                    },
                    required: ["instagram", "tiktok", "x", "snapchat", "youtube"]
                  }
                },
                required: ["name", "availability"]
              }
            }
          },
          required: ["results"]
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && Array.isArray(result.results)) {
      return result.results.filter((u: any) => u.name.length >= 3 && u.name.length <= 8);
    }
    return [];

  } catch (error) {
    console.error("Error generating usernames with Gemini:", error);
    throw new Error("فشل في الحصول على اقتراحات من الذكاء الاصطناعي. يرجى المحاولة لاحقاً.");
  }
}
