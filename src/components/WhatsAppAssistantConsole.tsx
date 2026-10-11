import React, { useState } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  DollarSign, 
  Package, 
  Bike, 
  ArrowRight,
  Code2, 
  Play,
  RotateCcw,
  Store,
  Phone,
  Gift,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { IbuyOutput, DispatchedOrder } from '../types/ibuy';
import { ZONAS_COATEPEC } from '../data/ibuyData';

interface WhatsAppAssistantConsoleProps {
  onProcessMessage: (message: string) => Promise<{ source: string; output: IbuyOutput }>;
  onDispatchOrder: (output: IbuyOutput) => void;
  simulatedTime: string;
  lastProcessedOutput: IbuyOutput | null;
  processingSource: string;
  isProcessing: boolean;
}

const PRESET_SCENARIOS = [
  {
    id: 'meyuca-tacos',
    title: '🌮 Tacos a Meyuca (Zona 3)',
    desc: 'Comida a ranchería: Tarifa $60 MXN',
    text: 'Hola buenas tardes IBUY, me traes 2 tacos de barbacoa y un consomé caliente de Doña Mary hasta Meyuca de Morelos por favor? Pago con un billete de $200'
  },
  {
    id: 'farmacia-stock',
    title: '💊 Farmacia Guadalajara (Stock)',
    desc: 'Medicamento: Flag requiere confirmación de stock',
    text: 'Buenas tardes me urge comprar una caja de Amoxicilina 500mg y un suero en Farmacia Guadalajara para entrega en El Calvario, pago en efectivo'
  },
  {
    id: 'negocio-cerrado',
    title: '🌙 Pedido tardío (Negocio Cerrado)',
    desc: 'Valida horario: Alerta NEGOCIO_CERRADO',
    text: 'Hola IBUY quiero pedir 1 kg de barbacoa de Doña Mary para llevar a San José, me urge por favor'
  },
  {
    id: 'reclutamiento',
    title: '🛵 Empleo de Repartidor (Reclutamiento)',
    desc: 'Intención de trabajo: Extrae candidato y vehículo',
    text: 'Buenas tardes quiero trabajar de repartidor en IBUY, tengo moto Italika FT150 con papeles en regla y casco. Me llamo Juan Carlos Tel 7224901234'
  },
  {
    id: 'tonatico-foraneo',
    title: '📦 Envío Foráneo a Tonatico (Zona 4)',
    desc: 'Municipio vecino: Tarifa $80 - $120 MXN',
    text: 'Buenas tardes necesito un mandado particular recoger unos documentos en la Presidencia de Coatepec y llevarlos urgente a Tonatico centro, pago con transferencia'
  },
  {
    id: 'zacango-abarrotes',
    title: '🥬 Abarrotes a Zacango (Zona 2)',
    desc: 'Colonia periférica: Tarifa $35 - $45 MXN',
    text: 'Hola me puedes traer 1 kilo de huevo y 1 litro de leche de la Cremería La Central a Zacango por la entrada principal? Llevo cambio de $100'
  },
  {
    id: 'consulta-horario',
    title: '❓ Consulta de Horario',
    desc: 'Acción CONSULTAR_HORARIO',
    text: 'Hola disculpa, ¿a qué hora abre y cierra la Pizzería Don Giovanni hoy?'
  }
];

export const WhatsAppAssistantConsole: React.FC<WhatsAppAssistantConsoleProps> = ({
  onProcessMessage,
  onDispatchOrder,
  simulatedTime,
  lastProcessedOutput,
  processingSource,
  isProcessing
}) => {
  const [inputText, setInputText] = useState(
    'Hola buenas tardes IBUY, me traes 2 tacos de barbacoa y un consomé caliente de Doña Mary hasta Meyuca de Morelos por favor? Pago con un billete de $200'
  );
  const [activeInspectorTab, setActiveInspectorTab] = useState<'json' | 'card' | 'api'>('json');
  const [copied, setCopied] = useState(false);
  const [dispatchedToast, setDispatchedToast] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    await onProcessMessage(inputText);
  };

  const handleCopyJson = () => {
    if (!lastProcessedOutput) return;
    navigator.clipboard.writeText(JSON.stringify(lastProcessedOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = () => {
    if (!lastProcessedOutput) return;
    onDispatchOrder(lastProcessedOutput);
    setDispatchedToast(true);
    setTimeout(() => setDispatchedToast(false), 3000);
  };

  const isClosedStore = lastProcessedOutput?.logistica?.mensaje_estado?.includes('NEGOCIO_CERRADO');
  const zoneInfo = lastProcessedOutput?.cliente?.zona ? ZONAS_COATEPEC[lastProcessedOutput.cliente.zona] : null;

  return (
    <div className="space-y-6">
      {/* Intro Header & Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-orange-500/20 text-orange-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Simulador de Asistente Virtual & Motor Central IBUY
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Procesa mensajes de clientes en lenguaje natural de Coatepec de Harinas. Valida horarios,
              calcula tarifas según la zona (1 a 4), evalúa stock en farmacias/tiendas, inyecta publicidad patrocinada y recluta nuevos repartidores con respuesta en 
              <strong className="text-slate-200"> JSON estricto</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Hora de Validación</div>
              <div className="font-mono font-bold text-amber-300">{simulatedTime} hrs</div>
            </div>
          </div>
        </div>

        {/* Quick Scenario Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium mb-2 flex items-center gap-1.5">
            <span>Escenarios de prueba preconfigurados:</span>
            <span className="text-slate-500 text-[10px]">(Haz clic para cargar y probar al instante)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => {
                  setInputText(scenario.text);
                  onProcessMessage(scenario.text);
                }}
                className="group text-left px-3 py-1.5 rounded-lg bg-slate-950/60 hover:bg-orange-500/10 border border-slate-800 hover:border-orange-500/30 text-xs text-slate-300 hover:text-orange-300 transition flex items-center gap-2"
              >
                <span>{scenario.title}</span>
                <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-orange-400 transition transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: WhatsApp Chat & Input (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[700px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* WhatsApp Header Bar */}
          <div className="bg-emerald-950/60 border-b border-emerald-800/40 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow">
                  IB
                </div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>IBUY Coatepec (Oficial)</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                </div>
                <div className="text-[11px] text-emerald-300/80 font-mono">
                  {isProcessing ? 'Escribiendo y analizando...' : 'En línea • Respuesta automática IA'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                WhatsApp Cloud API
              </span>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60">
            {/* System initial disclaimer */}
            <div className="flex justify-center">
              <span className="text-[10px] px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-center max-w-xs">
                🔒 Las órdenes son procesadas automáticamente por el motor central de IBUY Coatepec de Harinas.
              </span>
            </div>

            {/* Inbound user message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-emerald-600/90 text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-md">
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{inputText}</p>
                <div className="text-[9px] text-emerald-200/80 text-right mt-1 font-mono">
                  {simulatedTime} hrs • Enviado
                </div>
              </div>
            </div>

            {/* Bot Response Stream */}
            {isProcessing ? (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-slate-700/60 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-300 ml-1">Motor IBUY evaluando zona, stock y tarifas...</span>
                </div>
              </div>
            ) : lastProcessedOutput ? (
              <div className="flex flex-col gap-2.5">
                {/* Main AI reply bubble */}
                <div className="max-w-[90%] bg-slate-900 text-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-md border border-slate-800 space-y-2.5">
                  {/* Status header badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      lastProcessedOutput.accion_detectada === 'CREAR_PEDIDO'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : lastProcessedOutput.accion_detectada === 'RECLUTAMIENTO'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : lastProcessedOutput.accion_detectada === 'CONSULTAR_HORARIO'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      Acción: {lastProcessedOutput.accion_detectada}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Zona: {lastProcessedOutput.cliente.zona}
                    </span>
                  </div>

                  {/* Operational status alert */}
                  <div className={`p-2.5 rounded-xl text-xs flex gap-2 ${
                    isClosedStore
                      ? 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
                      : lastProcessedOutput.logistica.requiere_confirmacion_stock
                      ? 'bg-amber-950/50 text-amber-300 border border-amber-800/60'
                      : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                  }`}>
                    {isClosedStore ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : lastProcessedOutput.logistica.requiere_confirmacion_stock ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="leading-snug">
                      {lastProcessedOutput.logistica.mensaje_estado}
                    </div>
                  </div>

                  {/* Order Ticket Mini Card if CREAR_PEDIDO */}
                  {lastProcessedOutput.accion_detectada === 'CREAR_PEDIDO' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-slate-300 font-semibold">
                        <span className="flex items-center gap-1 text-orange-400">
                          <Store className="w-3.5 h-3.5" />
                          {lastProcessedOutput.pedido.establecimiento}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {lastProcessedOutput.logistica.tiempo_estimado_entrega_minutos} min
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 py-1 border-t border-b border-slate-800/60">
                        {lastProcessedOutput.pedido.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                            <span>{item.cantidad}x {item.producto}</span>
                            {item.notas && <span className="text-slate-500 text-[10px]">({item.notas})</span>}
                          </div>
                        ))}
                      </div>

                      {/* Financials */}
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Envío ({lastProcessedOutput.cliente.zona}):</span>
                        <span className="text-slate-200 font-mono font-medium">${lastProcessedOutput.pedido.costo_envio} MXN</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-white pt-1">
                        <span>Total Estimado:</span>
                        <span className="text-emerald-400 font-mono">${lastProcessedOutput.pedido.total_estimado} MXN</span>
                      </div>
                      {lastProcessedOutput.pedido.cambio_para > 0 && (
                        <div className="text-[10px] text-slate-400 italic">
                          * Llevar cambio para: ${lastProcessedOutput.pedido.cambio_para} MXN
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recruitment info mini card if RECLUTAMIENTO */}
                  {lastProcessedOutput.accion_detectada === 'RECLUTAMIENTO' && (
                    <div className="bg-purple-950/30 p-2.5 rounded-xl border border-purple-800/40 text-xs space-y-1.5">
                      <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-purple-400" />
                        Ficha de Aspirante Capturada
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-500">Candidato:</span>{' '}
                          {lastProcessedOutput.datos_reclutamiento.nombre_candidato || 'Por confirmar'}
                        </div>
                        <div>
                          <span className="text-slate-500">Teléfono:</span>{' '}
                          {lastProcessedOutput.datos_reclutamiento.telefono || 'Por confirmar'}
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">Vehículo:</span>{' '}
                          {lastProcessedOutput.datos_reclutamiento.vehiculo || 'Moto'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sponsored Ad Banner */}
                  {lastProcessedOutput.promocion_patrocinada.mostrar && (
                    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-2 rounded-xl border border-amber-500/30 text-xs">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">
                        <Gift className="w-3 h-3 text-amber-400" />
                        Recomendación Patrocinada IBUY:
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-white">{lastProcessedOutput.promocion_patrocinada.negocio}:</strong>{' '}
                        {lastProcessedOutput.promocion_patrocinada.mensaje}
                      </p>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-500 text-right pt-1 font-mono">
                    Procesado por {processingSource} • {simulatedTime} hrs
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 items-center">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Escribe un mensaje de WhatsApp o pedido de Coatepec..."
              rows={2}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition resize-none"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-orange-500/20 shrink-0 cursor-pointer"
            >
              {isProcessing ? (
                <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <span>Analizar</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: JSON Inspector & Operational Dispatch (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[700px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Header & Tabs */}
          <div className="bg-slate-950/80 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Code2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Inspector de Formato Obligatorio JSON</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Schema Válido
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Respuesta JSON estricta emitida por el motor para consumo de apps, repartidores y webhook
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveInspectorTab('json')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                    activeInspectorTab === 'json'
                      ? 'bg-orange-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw JSON
                </button>
                <button
                  onClick={() => setActiveInspectorTab('card')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                    activeInspectorTab === 'card'
                      ? 'bg-orange-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ficha Operativa
                </button>
                <button
                  onClick={() => setActiveInspectorTab('api')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                    activeInspectorTab === 'api'
                      ? 'bg-orange-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  API Spec
                </button>
              </div>

              <button
                onClick={handleCopyJson}
                disabled={!lastProcessedOutput}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                title="Copiar JSON completo al portapapeles"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Validation Rules Checklist Ribbon */}
          <div className="bg-slate-950/40 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Reglas del Prompt:</span>
            
            <span className={`inline-flex items-center gap-1 ${lastProcessedOutput?.accion_detectada ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>Acción clasificada</span>
            </span>

            <span className={`inline-flex items-center gap-1 ${lastProcessedOutput?.cliente?.zona ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>Zona y tarifa ({lastProcessedOutput?.cliente?.zona || 'Zona'})</span>
            </span>

            <span className={`inline-flex items-center gap-1 ${
              isClosedStore ? 'text-rose-400 font-bold' : lastProcessedOutput ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>{isClosedStore ? 'Negocio cerrado detectado' : 'Horario validado'}</span>
            </span>

            <span className={`inline-flex items-center gap-1 ${
              lastProcessedOutput?.logistica?.requiere_confirmacion_stock ? 'text-amber-400 font-bold' : lastProcessedOutput ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>Stock: {lastProcessedOutput?.logistica?.requiere_confirmacion_stock ? 'Requiere conf.' : 'Menú estándar'}</span>
            </span>

            <span className={`inline-flex items-center gap-1 ${lastProcessedOutput?.promocion_patrocinada?.mostrar ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>Publicidad inyectada</span>
            </span>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
            {activeInspectorTab === 'json' && (
              <div className="relative h-full">
                <pre className="h-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 overflow-auto text-[11px] leading-relaxed selection:bg-emerald-800 selection:text-white">
                  {lastProcessedOutput ? (
                    JSON.stringify(lastProcessedOutput, null, 2)
                  ) : (
                    <span className="text-slate-500">// Presiona "Analizar" para generar el objeto JSON con el motor IBUY</span>
                  )}
                </pre>
              </div>
            )}

            {activeInspectorTab === 'card' && lastProcessedOutput && (
              <div className="space-y-4 font-sans text-xs">
                {/* Visual Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Zone & Delivery Rate */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400" />
                        Zona de Entrega
                      </span>
                      <span className="font-mono text-orange-400">{lastProcessedOutput.cliente.zona}</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {zoneInfo?.nombre || lastProcessedOutput.cliente.direccion_entrega}
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Tarifa de envío:</span>
                      <strong className="text-emerald-400 font-mono">${lastProcessedOutput.pedido.costo_envio} MXN</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Tiempo estimado: {lastProcessedOutput.logistica.tiempo_estimado_entrega_minutos} min
                    </div>
                  </div>

                  {/* Financials & Payment */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        Finanzas del Pedido
                      </span>
                      <span className="font-mono text-emerald-400">{lastProcessedOutput.pedido.metodo_pago}</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      Total: ${lastProcessedOutput.pedido.total_estimado} MXN
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Subtotal comercio:</span>
                      <span className="font-mono text-slate-300">${lastProcessedOutput.pedido.subtotal_estimado} MXN</span>
                    </div>
                    {lastProcessedOutput.pedido.cambio_para > 0 && (
                      <div className="text-[10px] text-amber-300 font-medium">
                        Repartidor debe llevar cambio para: ${lastProcessedOutput.pedido.cambio_para} MXN
                      </div>
                    )}
                  </div>

                  {/* Stock Confirmation Status */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Package className="w-3 h-3 text-amber-400" />
                      Protocolo de Stock
                    </div>
                    <div className={`text-xs font-semibold ${
                      lastProcessedOutput.logistica.requiere_confirmacion_stock ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {lastProcessedOutput.logistica.requiere_confirmacion_stock
                        ? '⚠️ REQUIERE CONFIRMACIÓN DE STOCK'
                        : '✅ Menú o producto estándar disponible'}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {lastProcessedOutput.logistica.requiere_confirmacion_stock
                        ? 'El repartidor llamará o verificará existencia en farmacia/mostrador antes de cobrar.'
                        : 'El comercio prepara el pedido de inmediato.'}
                    </p>
                  </div>

                  {/* Sponsored Ad Info */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Gift className="w-3 h-3 text-orange-400" />
                      Comercio Patrocinador Inyectado
                    </div>
                    <div className="text-xs font-bold text-white">
                      {lastProcessedOutput.promocion_patrocinada.negocio}
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      "{lastProcessedOutput.promocion_patrocinada.mensaje}"
                    </p>
                  </div>
                </div>

                {/* Status Message Display */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Mensaje Oficial para el Cliente (logistica.mensaje_estado)
                  </div>
                  <p className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-sans">
                    {lastProcessedOutput.logistica.mensaje_estado}
                  </p>
                </div>
              </div>
            )}

            {activeInspectorTab === 'api' && (
              <div className="space-y-4 font-mono text-[11px] text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-orange-400 font-bold">POST</span> /api/process
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                    Endpoint central para webhook de WhatsApp Cloud API, app móvil o chat web.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Request Payload (cURL):</div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto text-[10px]">
{`curl -X POST https://TU-PROYECTO.vercel.app/api/process \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "${inputText.replace(/"/g, '\\"')}",
    "simulatedTime": "${simulatedTime}"
  }'`}
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Variables de Entorno:</div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-sans text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-mono text-slate-400">GEMINI_API_KEY:</span>
                      <span className="text-emerald-400 font-mono">Variable de entorno en Vercel</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-slate-400">Modelo Seleccionado:</span>
                      <span className="text-amber-400 font-mono">gemini-3.8-flash</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Dispatch Action Bar */}
          <div className="bg-slate-950 border-t border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-2">
              {dispatchedToast ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Orden despachada con éxito a la Torre de Control!</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  {lastProcessedOutput?.accion_detectada === 'CREAR_PEDIDO' ? (
                    <span>¿Listo para asignar repartidor y enviar a ruta?</span>
                  ) : lastProcessedOutput?.accion_detectada === 'RECLUTAMIENTO' ? (
                    <span>Aspirante listo para agendar entrevista en la flotilla.</span>
                  ) : (
                    <span>Consulta procesada con éxito.</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDispatch}
                disabled={!lastProcessedOutput || lastProcessedOutput.accion_detectada !== 'CREAR_PEDIDO'}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Despachar a Torre de Control</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
