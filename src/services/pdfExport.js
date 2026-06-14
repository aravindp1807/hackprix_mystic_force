import { getAll, saveAll } from '../utils/storage';
import { transcribeAudio } from './elevenlabs';

/**
 * Helper to fetch a Blob from a URL (handles local blob: URLs or remote HTTP URLs)
 */
async function fetchBlobFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.blob();
  } catch (error) {
    console.error('Failed to fetch blob from URL:', url, error);
    return null;
  }
}

/**
 * Iterates over all sections to find audio entries that lack a transcript,
 * fetches their audio file, and transcribes them using ElevenLabs.
 */
export async function transcribeMissingAudio() {
  const data = getAll();
  let modified = false;

  // We look for audio entries in 'audio' section and any other section if activeMode was audio
  const sectionsToCheck = ['audio', 'happy']; // MemoryStudio saves to happy

  for (const section of sectionsToCheck) {
    if (!data[section]) continue;

    for (let i = 0; i < data[section].length; i++) {
      const entry = data[section][i];
      
      // Check if it's an audio entry without a transcript
      const isAudioEntry = section === 'audio' || entry.audioType || (entry.photo && entry.photo.includes('blob:'));
      
      if (isAudioEntry && !entry.transcript && entry.photo) {
        console.log(`[PDF Export] Transcribing audio entry: ${entry.title}`);
        
        try {
          const blob = await fetchBlobFromUrl(entry.photo);
          if (blob) {
            const transcript = await transcribeAudio(blob);
            if (transcript) {
              entry.transcript = transcript;
              modified = true;
              console.log(`[PDF Export] Transcription success:`, transcript.substring(0, 50) + '...');
            }
          }
        } catch (err) {
          console.error(`[PDF Export] Failed to transcribe entry ${entry.title}:`, err);
        }
      }
    }
  }

  // Save the updated data back to localStorage if modifications were made
  if (modified) {
    saveAll(data);
  }

  return modified;
}

/**
 * Compiles all diary entries into a single text document optimized for Gemini.
 */
export function compileDiaryData() {
  const data = getAll();
  let compiledText = "# Dear Me - Synthetic Memory Compilation\n\n";

  // About Me context (could be useful for Gemini)
  compiledText += "## Profile & Context\n";
  const profile = data.profile || {};
  if (profile.identity) {
    compiledText += `Name: ${profile.identity.name || 'Unknown'}\n`;
    compiledText += `Mother Tongue: ${profile.identity.motherTongue || 'Not specified'}\n`;
  }
  compiledText += "\n---\n\n";

  // Iterate over all diary sections
  const sections = ['friends', 'places', 'relationships', 'sad', 'lessons', 'happy', 'bucket', 'dates', 'philosophy', 'audio', 'mothertongue'];
  
  sections.forEach(section => {
    const entries = data[section] || [];
    if (entries.length > 0) {
      compiledText += `## Section: ${section.toUpperCase()}\n\n`;
      
      entries.forEach(entry => {
        compiledText += `### ${entry.title} (${entry.date})\n`;
        if (entry.mood) compiledText += `Mood: ${entry.mood}\n`;
        
        // Generic fields
        if (entry.description) compiledText += `Description: ${entry.description}\n`;
        
        // Audio specific
        if (entry.audioType) compiledText += `Audio Type: ${entry.audioType}\n`;
        if (entry.speaker) compiledText += `Speaker: ${entry.speaker}\n`;
        if (entry.transcript) compiledText += `Transcript: ${entry.transcript}\n`;
        
        // Mother tongue specific
        if (entry.nativeMemory) compiledText += `Native Memory: ${entry.nativeMemory}\n`;
        if (entry.englishTranslation) compiledText += `English Translation: ${entry.englishTranslation}\n`;
        
        // Add other dynamic fields dynamically
        Object.keys(entry).forEach(key => {
          if (!['id', 'title', 'date', 'mood', 'photo', 'rawFile', 'description', 'audioType', 'speaker', 'transcript', 'nativeMemory', 'englishTranslation'].includes(key)) {
             if (typeof entry[key] === 'string' && entry[key].trim().length > 0) {
               // Capitalize key
               const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
               compiledText += `${label}: ${entry[key]}\n`;
             }
          }
        });
        
        compiledText += `\n`;
      });
      compiledText += `---\n\n`;
    }
  });

  return compiledText;
}

/**
 * Main function to prepare data: transcribes missing audio, then downloads the text compilation.
 */
export async function preparePdfData() {
  // 1. Transcribe any missing audio
  await transcribeMissingAudio();
  
  // 2. Compile the data
  const textData = compileDiaryData();
  
  // 3. Trigger download of the text file for Gemini
  const blob = new Blob([textData], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `diary_bundle_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return textData;
}
