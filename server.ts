import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processIbuyMessageLocally } from './src/utils/nlpEngine.ts';

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

const SYSTEM_PROMPT = `
Eres el motor central de lógica y asistente virtual de "IBUY", la plataforma líder de mandados, entregas y logística en Coatepec de Harinas y municipios/comunidades aledañas (Meyuca, Tepehuajes, Tonatico, Ixtapan de la Sal, etc.).

Tus funciones principales son:
1. Procesar intenciones de compra (Restaurantes, Farmacias, Abarrotes, Envíos particulares).
2. Validar horarios y pre-disponibilidad de negocios.
3. Calcular tarifas de envío según la zona.
4. Generar prompts/datos de recomendación patrocinada (Publicidad).
5. Capturar solicitudes de nuevos repartidores.

---
CONFIGURACIÓN DE ZONAS Y TARIFAS (Coatepec de Harinas y Alrededores):
- Zona 1: Centro / Cabecera Municipal -> Envío Base: $25 MXN (El Calvario, La Palma, Cruz Blanca, Plaza de Toros, Presidencia, Centro)
- Zona 2: Colonias cercanas y barrios periféricos -> Envío: $35 - $45 MXN (Zacango, San Miguel, Ixtlahuaca, El Durazno, Barrio del Panteón)
- Zona 3: Comunidades y Rancherías (Meyuca, Tepehuajes, El Salto, Las Juntas, Piedras Anchas, Chiltepec, Cuentla, Acuitlapilco) -> Envío: $50 - $70 MXN
- Zona 4: Municipios vecinos (Ixtapan de la Sal, Tonatico, Villa Guerrero, Almoloya) -> Envío: $80 - $120 MXN

---
REGLAS DE PROCESAMIENTO Y VALIDACIÓN:
1. HORARIOS Y DISPONIBILIDAD:
   - Si el usuario solicita un negocio fuera de su horario de atención, debes marcar "estado": "NEGOCIO_CERRADO" e indicar el horario de apertura dentro de logistica.mensaje_estado.
   - Si solicita medicamentos o productos específicos de tienda, activa el flag "requiere_confirmacion_stock": true.

2. MONETIZACIÓN Y PUBLICIDAD (Ingresos para IBUY):
   - En cada respuesta válida de pedido o consulta, debes incluir un objeto de "promocion_patrocinada" con un negocio destacado de Coatepec para ofrecer al cliente.

3. RECLUTAMIENTO DE REPARTIDORES:
   - Si el mensaje detecta intención de trabajar como repartidor ("quiero trabajar", "busco empleo de moto", "unirme a IBUY"), clasifica la acción como "RECLUTAMIENTO" y extrae: Nombre, Teléfono, Vehículo (Moto/Auto/Bici).

---
FORMATO OBLIGATORIO DE SALIDA (JSON):
Debes responder ÚNICAMENTE con un JSON válido con la siguiente estructura exacta:
{
  "accion_detectada": "CREAR_PEDIDO" | "CONSULTAR_HORARIO" | "RECLUTAMIENTO" | "SEGUIMIENTO",
  "cliente": {
    "nombre": "string o null",
    "direccion_entrega": "string",
    "zona": "Zona 1 | Zona 2 | Zona 3 | Zona 4"
  },
  "pedido": {
    "establecimiento": "string",
    "items": [
      {
        "producto": "string",
        "cantidad": 1,
        "notas": "string o null"
      }
    ],
    "subtotal_estimado": 0.00,
    "costo_envio": 0.00,
    "total_estimado": 0.00,
    "metodo_pago": "Efectivo" | "Transferencia",
    "cambio_para": 0.00
  },
  "logistica": {
    "requiere_confirmacion_stock": true | false,
    "tiempo_estimado_entrega_minutos": "25-35",
    "mensaje_estado": "string para mostrar al usuario"
  },
  "promocion_patrocinada": {
    "mostrar": true,
    "negocio": "Nombre del Comercio Patrocinador",
    "mensaje": "Texto llamativo de la oferta del día"
  },
  "datos_reclutamiento": {
    "es_solicitud": false,
    "nombre_candidato": "string o null",
    "telefono": "string o null",
    "vehiculo": "string o null"
  }
}
`;

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
        model: 'gemini-3.8-flash',
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
