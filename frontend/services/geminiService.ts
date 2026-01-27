
import { GoogleGenAI } from "@google/genai";
import { Message, Agent } from "../types";

export const generateAgentResponse = async (
  agent: Agent,
  history: Message[],
  userInput: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Format history for Gemini
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: userInput }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction: agent.systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong while connecting to the AI. Please check your API key.";
  }
};
