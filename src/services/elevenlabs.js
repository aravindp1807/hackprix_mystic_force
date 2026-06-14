const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const STT_API_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

/**
 * Transcribe an audio file using ElevenLabs Scribe API.
 * @param {Blob|File} audioBlob - The audio file to transcribe
 * @returns {Promise<string>} The transcribed text
 */
export async function transcribeAudio(audioBlob) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key is missing. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
  }

  const formData = new FormData();
  // Ensure the blob has a filename, some APIs require it
  const file = audioBlob instanceof File ? audioBlob : new File([audioBlob], 'audio.webm', { type: audioBlob.type || 'audio/webm' });
  
  formData.append('file', file);
  formData.append('model_id', 'scribe_v2');

  try {
    const response = await fetch(STT_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs] API Error:', errorText);
      throw new Error(`Transcription failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.text; // Scribe returns { text: "..." }
  } catch (err) {
    console.error('[ElevenLabs] Transcription error:', err);
    throw err;
  }
}
