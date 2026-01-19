
import { GoogleGenAI, Type } from "@google/genai";
import { Wall, Furniture, FurnitureType, ProjectReport } from "../types";

export const getProjectReport = async (walls: Wall[], furniture: Furniture[]): Promise<ProjectReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalWallLengthPx = walls.reduce((sum, w) => sum + Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y), 0);
  const totalWallMeters = totalWallLengthPx * 0.05; 
  const furnitureCounts = furniture.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    Analyze this interior construction project:
    - Total Wall Length: ${totalWallMeters.toFixed(2)} meters
    - Furniture List: ${JSON.stringify(furnitureCounts)}

    ในฐานะผู้รับเหมามืออาชีพในไทย ให้สร้าง "Project Report" ในรูปแบบ JSON:
    1. items: รายการวัสดุ { name: string, quantity: number, unit: string, estimatedPrice: number, description: string }
    2. totalEstimate: ราคาก่อสร้างโดยประมาณ (บาท)
    3. summary: สรุปคำแนะนำทางเทคนิคสำหรับการก่อสร้างเป็นภาษาไทย
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
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                }
              }
            },
            totalEstimate: { type: Type.NUMBER },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    throw error;
  }
};

export const convertImageToFloorPlan = async (base64Image: string): Promise<{ walls: Wall[], furniture: Furniture[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    วิเคราะห์ภาพถ่ายห้องหรือภาพวาดแผนผังนี้ และสกัดโครงสร้างออกมาเป็นพิกัด JSON
    walls: { start: {x, y}, end: {x, y} }
    furniture: { type, position: {x, y}, width, height }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(",")[1] || base64Image } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: "application/json" }
    });
    const data = JSON.parse(response.text);
    return {
      walls: (data.walls || []).map((w: any) => ({ ...w, id: Math.random().toString(), thickness: 8 })),
      furniture: (data.furniture || []).map((f: any) => ({ ...f, id: Math.random().toString(), rotation: 0 }))
    };
  } catch (err) {
    return { walls: [], furniture: [] };
  }
};

export const generateVisualization = async (promptText: string, style: string = 'Modern Luxury'): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // ปรับแต่ง Prompt ให้มีความสมจริงและเป็นมืออาชีพมากขึ้น
  const enhancedPrompt = `
    High-end interior design visualization, ${style} style. 
    Scene details: ${promptText}.
    Atmosphere: Cinematic lighting, natural sunlight from windows, realistic materials (marble, polished wood, high-quality fabric), 
    Technical: Photorealistic, 8k resolution, architectural photography, shot on 35mm lens, sharp focus, volumetric lighting, ray-traced reflections.
    No humans, clean and professional look.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: enhancedPrompt,
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (err) { 
    console.error("Visualization error:", err);
    return null; 
  }
};
