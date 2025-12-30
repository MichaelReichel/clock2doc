
import { GoogleGenAI } from "@google/genai";
import { TimeEntry } from "../types";

export const generateInvoiceSummary = async (entries: TimeEntry[]): Promise<string> => {
  // Fix: Initialize GoogleGenAI with the correct named parameter and directly from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const projects = Array.from(new Set(entries.map(e => e.project)));
  const totalHours = entries.reduce((acc, curr) => acc + curr.durationDecimal, 0).toFixed(2);
  const taskDescriptions = entries.slice(0, 10).map(e => e.description).filter(Boolean).join(', ');

  const prompt = `
    Generate a professional 2-3 sentence executive summary for a client invoice.
    Projects involved: ${projects.join(', ')}.
    Total billable hours: ${totalHours}.
    Key tasks performed: ${taskDescriptions}.
    The tone should be professional, appreciative, and concise. Do not use placeholders like [Name].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Access .text property directly as per latest SDK guidelines
    return response.text || "Professional services rendered for the specified period.";
  } catch (error) {
    console.error("Gemini summary error:", error);
    return "Professional services rendered for the specified period.";
  }
};
