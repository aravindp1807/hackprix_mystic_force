import { fetchObsidianKnowledgeBase } from './backend';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
let chatHistory = [];
let isInitialized = false;

export async function initSyntheticMind() {
  if (isInitialized) return true;

  // Fetch tone and essence from backend
  const obsidianKnowledge = await fetchObsidianKnowledgeBase();
  
  const systemPrompt = `
You are the "Synthetic Mind". You must adopt the exact tone, essence, and knowledge presented in the following Obsidian markdown files. 
You are an AI representation of the user's brain/mind. Speak as if you are this Synthetic Mind, with all its context, memories, and communication style.

--- OBSIDIAN KNOWLEDGE BASE ---
${obsidianKnowledge}
-------------------------------
`;

  chatHistory = [
    { role: "system", content: systemPrompt }
  ];

  isInitialized = true;
  return true;
}

export async function sendMessageToSyntheticMind(message) {
  if (!isInitialized) {
    await initSyntheticMind();
  }
  
  chatHistory.push({ role: "user", content: message });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-3-12b-it",
        messages: chatHistory,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    chatHistory.push({ role: "assistant", content: reply });
    
    return reply;
  } catch (err) {
    console.error("OpenRouter SendMessage Error:", err);
    throw new Error(err.message || "Unknown OpenRouter API error");
  }
}

export function resetChat() {
  isInitialized = false;
  chatHistory = [];
}
