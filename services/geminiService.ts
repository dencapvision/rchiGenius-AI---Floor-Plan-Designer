
import { GoogleGenAI, Type } from "@google/genai";
import { Wall, Furniture, FurnitureType, ProjectReport } from "../types";

export const getProjectReport = async (walls: Wall[], furniture: Furniture[]): Promise<ProjectReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Calculate raw metrics
  const totalWallLengthPx = walls.reduce((sum, w) => sum + Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y), 0);
  const totalWallMeters = totalWallLengthPx * 0.05; // 20px = 1m
  const furnitureCounts = furniture.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    Analyze this interior construction project:
    - Total Wall Length: ${totalWallMeters.toFixed(2)} meters
    - Furniture List: ${JSON.stringify(furnitureCounts)}

    As a professional Thai contractor, generate a "Project Report" in JSON format with these fields:
    1. items: Array of objects { name: string, quantity: number, unit: string, estimatedPrice: number, description: string }
       Include materials like bricks/gypsum, paint based on wall length, and furniture items.
    2. totalEstimate: Total cost in THB (approximate).
    3. summary: A technical summary in Thai advising on the construction steps.

    Use realistic current market prices in Thailand.
    Output MUST be only valid JSON.
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
    console.error("BOQ Generation Error:", error);
    throw error;
  }
};

export const convertImageToFloorPlan = async (base64Image: string): Promise<{ walls: Wall[], furniture: Furniture[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this photo of a room or floor plan and extract structural layout.
    Return only a valid JSON object with "walls" and "furniture" arrays.
    Coordinate System: 1000x1000.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(",")[1] || base64Image } },
        { text: prompt }
      ],
      config: { responseMimeType: "application/json" }
    });
    const data = JSON.parse(response.text);
    const scale = 0.8; 
    return {
      walls: (data.walls || []).map((w: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        start: { x: Math.round(w.start.x * scale / 20) * 20, y: Math.round(w.start.y * scale / 20) * 20 },
        end: { x: Math.round(w.end.x * scale / 20) * 20, y: Math.round(w.end.y * scale / 20) * 20 },
        thickness: 8
      })),
      furniture: (data.furniture || []).map((f: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        type: (Object.values(FurnitureType).includes(f.type) ? f.type : FurnitureType.TABLE) as FurnitureType,
        position: { x: Math.round(f.position.x * scale / 20) * 20, y: Math.round(f.position.y * scale / 20) * 20 },
        rotation: 0,
        width: f.width || 60,
        height: f.height || 40
      }))
    };
  } catch (err) {
    return { walls: [], furniture: [] };
  }
};

export const generateVisualization = async (promptText: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: `Professional architectural interior render, daytime lighting, ${promptText}.` }],
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (err) { return null; }
};
