"use server";

import { GoogleGenAI } from "@google/genai";

export async function generateDescription(eventDetails: {
  title: string;
  category?: string;
  city?: string;
  venue?: string;
  startTime?: string;
  endTime?: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "AI service not configured. Missing GEMINI_API_KEY." };
  }

  const client = new GoogleGenAI({ apiKey });

  const parts: string[] = [];
  if (eventDetails.title) parts.push(`Event: ${eventDetails.title}`);
  if (eventDetails.category) parts.push(`Category: ${eventDetails.category}`);
  if (eventDetails.city) parts.push(`City: ${eventDetails.city}`);
  if (eventDetails.venue) parts.push(`Venue: ${eventDetails.venue}`);
  if (eventDetails.startTime) parts.push(`Start: ${eventDetails.startTime}`);
  if (eventDetails.endTime) parts.push(`End: ${eventDetails.endTime}`);

  const prompt = `Write a compelling event description for the following event.
Make it engaging, informative, and suitable for an event listing page.
Keep it between 100-200 words. Use a professional but enthusiastic tone.
Do NOT use markdown formatting, just plain text with paragraphs.

${parts.join("\n")}`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "";
    if (!text) {
      return { error: "AI returned an empty response." };
    }

    return { description: text.trim() };
  } catch (err) {
    console.error("Gemini error:", err);
    return { error: "Failed to generate description. Please try again." };
  }
}
