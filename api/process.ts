import { GoogleGenAI } from '@google/genai';
import { processIbuyMessageLocally } from '../src/utils/nlpEngine.js';
import { SYSTEM_PROMPT } from '../src/utils/systemPrompt.js';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export async function POST(request: Request) {
  let body: { message?: unknown; simulatedTime?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const { message, simulatedTime } = body;
  if (!message || typeof message !== 'string') {
    return Response.json({ error: 'El parámetro "message" es requerido.' }, { status: 400 });
  }
  const timeString = typeof simulatedTime === 'string' && simulatedTime ? simulatedTime : '14:30';

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Hora actual simulada en Coatepec de Harinas: ${timeString} hrs.\nMensaje del usuario entrante por WhatsApp/App:\n"${message}"`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
      const textOutput = response.text;
      if (textOutput) {
        return Response.json({ source: MODEL, output: JSON.parse(textOutput.trim()) });
      }
    } catch (err) {
      console.warn('Gemini falló, usando motor local:', err);
    }
  }

  const localOutput = processIbuyMessageLocally(message, { simulatedTime: timeString });
  return Response.json({ source: 'ibuy-deterministic-engine', output: localOutput });
}
