const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/translate';

// Map common language names to Sarvam language codes
const languageMap = {
  hindi: 'hi-IN',
  bengali: 'bn-IN',
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  marathi: 'mr-IN',
  odia: 'or-IN',
  punjabi: 'pa-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  gujarati: 'gu-IN'
};

export function getLanguageCode(languageName) {
  if (!languageName) return null;
  const normalized = languageName.toLowerCase().trim();
  return languageMap[normalized] || null;
}

export function isLanguageSupported(languageName) {
  return !!getLanguageCode(languageName);
}

export async function translateText(text, sourceLanguageName, targetLanguageCode = 'en-IN') {
  if (!text || !text.trim()) return '';
  
  const sourceCode = getLanguageCode(sourceLanguageName);
  
  if (!sourceCode) {
    throw new Error(`Language "${sourceLanguageName}" is not supported for translation.`);
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        input: text,
        source_language_code: sourceCode,
        target_language_code: targetLanguageCode,
        speaker_gender: 'Female', // Defaulting as required
        mode: 'formal',
        model: 'sarvam-translate'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam API error:', errorText);
      throw new Error(`Translation failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.translated_text; 
  } catch (err) {
    console.error('Error translating text:', err);
    throw err;
  }
}
