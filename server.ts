import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processIbuyMessageLocally } from './src/utils/nlpEngine.ts';
import { SYSTEM_PROMPT } from './src/utils/systemPrompt.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize GoogleGenAI client according to AI Studio guidelines
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}


// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'IBUY Coatepec de Harinas',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Primary processing endpoint
app.post('/api/process', async (req, res) => {
  const { message, simulatedTime } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'El parámetro "message" es requerido.' });
  }

  const timeString = simulatedTime || '14:30';

  // If Gemini API is available, try it first
  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        contents: `Hora actual simulada en Coatepec de Harinas: ${timeString} hrs.\nMensaje del usuario entrante por WhatsApp/App:\n"${message}"`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const textOutput = response.text;
      if (textOutput) {
        const parsed = JSON.parse(textOutput.trim());
        return res.json({
          source: 'gemini-3.8-flash',
          output: parsed,
        });
      }
    } catch (err) {
      console.warn('Gemini API call failed or threw error, falling back to local NLP engine:', err);
    }
  }

  // Deterministic local engine fallback
  const localOutput = processIbuyMessageLocally(message, { simulatedTime: timeString });
  return res.json({
    source: 'ibuy-deterministic-engine',
    output: localOutput,
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`IBUY Logistics server ready on http://0.0.0.0:${port}`);
  });
}

startServer();
