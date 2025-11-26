
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash";

if (!API_KEY) {
    console.error("CRITICAL: VITE_GEMINI_API_KEY is missing in .env file.");
}

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

let requestCount = 0;
let windowStart = Date.now();

const checkRateLimit = () => {
    const now = Date.now();
    if (now - windowStart > RATE_LIMIT_WINDOW) {
        requestCount = 0;
        windowStart = now;
    }
    if (requestCount >= MAX_REQUESTS) {
        const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW - (now - windowStart)) / 1000);
        throw new Error(`API rate limit exceeded. Please wait ${waitSeconds} seconds.`);
    }
    requestCount++;
};

// --- Interfaces ---
export interface AcademicData {
    id?: string;
    word: string;
    type: string;
    engDefinition: string;
    turkish: string;
    synonyms: string;
    academicSentences: string[];
}

export interface ContextStory {
    englishStory: string;
    turkishTranslation: string;
    usedWords: string[];
}

// --- Helper: Clean AI Response ---
const cleanAndParseResponse = (text: string) => {
    try {
        let cleanText = text.replace(/```json|```/g, '').trim();
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("JSON Parsing Failed. Raw Text:", text);
        throw new Error("AI response was not valid JSON. Please try again.");
    }
};


async function callGeminiAPI(promptText: string) {
    checkRateLimit();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: promptText }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// --- Core Function 1: Fetch Word Details ---
export async function fetchAcademicData(word: string): Promise<AcademicData> {
    const prompt = `
    You are an expert Academic Linguist specializing in YÖKDİL, YDS, and TOEFL preparation.
    Your task is to provide strict, high-level vocabulary data for the word: "${word}".

    OUTPUT RULES:
    1. Return strictly valid JSON. No Markdown formatting.
    2. Target Level: B2/C1 (Graduate Student Level).
    3. IMPORTANT: In the 'academicSentences', you MUST wrap the target word (and its morphological variations) in (Markdown bold). 
       Example: "The **analysis** indicated significant results."

    JSON STRUCTURE:
    {
      "word": "${word}",
      "type": "Part of speech (e.g., Noun, Verb). Choose the most academic form.",
      "engDefinition": "A precise, C1-level academic definition. Concise (Max 15 words).",
      "turkish": "The most appropriate contextual academic Turkish meaning.",
      "synonyms": "3 distinct, high-level academic synonyms (comma-separated).",
      "academicSentences": [
        "Sentence 1: Focus on Natural Sciences/Engineering context. (Max 25 words)",
        "Sentence 2: Focus on Social Sciences/Methodology context. (Max 25 words)",
        "Sentence 3: General Academic context. (Max 25 words)"
      ]
    }
  `;

    try {
        const rawText = await callGeminiAPI(prompt);
        const data = cleanAndParseResponse(rawText);
        return data as AcademicData;
    } catch (error) {
        console.error("Gemini API Error (fetchAcademicData):", error);
        throw error;
    }
}

// --- Core Function 2: Context Builder (Story Mode) ---
export async function generateContextStory(words: string[]): Promise<ContextStory> {
    const wordList = words.join(", ");
    const prompt = `
    You are an academic writing tutor.
    Task: Weave the following words into a coherent, high-quality academic paragraph: [${wordList}].

    RULES:
    1. Do NOT just list sentences. Create a logical flow (e.g., Context -> Problem -> Solution).
    2. The tone must be scientific or research-oriented.
    3. CRITICAL: Wrap the target words in (Markdown bold) wherever they appear in the story. Example: "The **evidence** suggested..."
    4. Provide a professional Turkish translation.

    OUTPUT JSON:
    {
      "englishStory": "The coherent academic paragraph...",
      "turkishTranslation": "The Turkish translation...",
      "usedWords": ["List of words successfully included"]
    }
  `;

    try {
        const rawText = await callGeminiAPI(prompt);
        const data = cleanAndParseResponse(rawText);
        return data as ContextStory;
    } catch (error) {
        console.error("Gemini API Error (generateContextStory):", error);
        throw error;
    }
}