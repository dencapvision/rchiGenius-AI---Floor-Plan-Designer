
import { GoogleGenAI, Type } from "@google/genai";
import { Wall, Furniture } from "../types";

// Removed global constant for API_KEY to strictly follow direct process.env.API_KEY requirement

export const getDesignAdvice = async (walls: Wall[], furniture: Furniture[]): Promise<string> => {
  // Fix: Initialize client inside the function using direct environment variable
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const layoutDescription = `
    Walls: ${JSON.stringify(walls)}
    Furniture: ${JSON.stringify(furniture)}
  `;

  const prompt = `
    As a world-class interior designer and architect, analyze this 2D floor plan layout:
    ${layoutDescription}

    Provide feedback in Thai language. 
    1. Critique the space utilization.
    2. Suggest improvements for ergonomics and flow.
    3. Suggest lighting or ventilation tips.
    Keep it professional and constructive.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    // Fix: Use .text property instead of .text() method
    return response.text || "ขออภัย ไม่สามารถวิเคราะห์ได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "เกิดข้อผิดพลาดในการติดต่อ AI";
  }
};

export const generateVisualization = async (promptText: string): Promise<string | null> => {
  // Fix: Initialize client inside the function using direct environment variable
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A high-quality 3D interior render of a modern home based on this description: ${promptText}. Cinematic lighting, architectural photography style, 4k resolution, detailed textures.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    // Fix: Correctly iterate through parts to find image data
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
