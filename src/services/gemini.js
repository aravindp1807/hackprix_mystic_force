import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchObsidianKnowledgeBase } from './backend';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;
let chatSession = null;
let isInitialized = false;

export async function initSyntheticMind() {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env");
  }

  if (isInitialized && chatSession) return chatSession;

  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  // Fetch tone and essence from backend
  const obsidianKnowledge = await fetchObsidianKnowledgeBase();
  
  const systemInstruction = `
You are the "Synthetic Mind". You must adopt the exact tone, essence, and knowledge presented in the following Obsidian markdown files. 
You are an AI representation of the user's brain/mind. Speak as if you are this Synthetic Mind, with all its context, memories, and communication style.

--- OBSIDIAN KNOWLEDGE BASE ---
${obsidianKnowledge}
-------------------------------
`;

  // We use gemini-flash-latest as it supports systemInstruction and is fast
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: systemInstruction 
  });

  chatSession = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 2000,
    },
  });

  isInitialized = true;
  return chatSession;
}

export async function sendMessageToSyntheticMind(message) {
  if (!isInitialized || !chatSession) {
    await initSyntheticMind();
  }
  
  try {
    const result = await chatSession.sendMessage(message);
    return result.response.text();
  } catch (err) {
    console.error("Gemini SendMessage Error:", err);
    throw new Error(err.message || "Unknown Gemini API error");
  }
}

export function resetChat() {
  isInitialized = false;
  chatSession = null;
}
