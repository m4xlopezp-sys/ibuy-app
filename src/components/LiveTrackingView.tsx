import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Bike, 
  Store, 
  DollarSign, 
  ArrowLeft, 
  Share2,
  Receipt,
  Sparkles,
  Radio,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Info,
  Star
} from 'lucide-react';
import { DispatchedOrder, OrderStatus, CalificacionPedido } from '../types/ibuy';
import { ZONAS_COATEPEC } from '../data/ibuyData';
import { RatingModal } from './RatingModal';

interface LiveTrackingViewProps {
  order: DispatchedOrder;
  onBack: () => void;
  onAdvanceStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  userCoords?: { lat: number; lng: number; addressName?: string } | null;
  onSubmitRating?: (orderId: string, rating: CalificacionPedido) => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  order,
  onBack,
  onAdvanceStatus,
  onSubmitRating
}) => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const zoneInfo = ZONAS_COATEPEC[order.data.cliente.zona] || ZONAS_COATEPEC['Zona 1'];

  // Status mapping for progress along the representative route (strictly status-based, non-GPS)
  const getStatusTrackingData = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE':
      case 'VALIDANDO_STOCK':
      case 'ASIGNADO':
        return {
          progress: 8,
          stepIndex: 0,
          statusTitle: '1. Repartidor Asignado',
          statusSubtitle: `${order.repartidorAsignado || 'El repartidor'} se encuentra en camino al establecimiento.`,
          distanceText: `Rumbo al comercio (${order.data.pedido.establecimiento})`,
          etaText: `${order.data.logistica.tiempo_estimado_entrega_minutos || '20-30'} min`,
          mapLabel: 'Conductor asignado en camino a la tienda',
          roadSpeed: '30 km/h • En camino al negocio',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        };
      case 'LLEGUE_AL_NEGOCIO':
        return {
          progress: 18,
          stepIndex: 1,
          statusTitle: '2. Repartidor en el Establecimiento',
          statusSubtitle: `Llegó a "${order.data.pedido.establecimiento}". Solicitando tus productos en mostrador.`,
          distanceText: `En mostrador de ${order.data.pedido.establecimiento}`,
          etaText: '18-25 min',
          mapLabel: 'Repartidor en el mostrador del comercio',
          roadSpeed: '0 km/h • En tienda',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'ESPERANDO_PEDIDO':
        return {
          progress: 22,
          stepIndex: 2,
          statusTitle: '3. Esperando Entrega de Pedido',
          statusSubtitle: 'El comercio está empacando tus artículos para entregárselos al repartidor.',
          distanceText: 'Empacando en el comercio',
          etaText: '15-20 min',
          mapLabel: 'Empaque de productos en mostrador',
          roadSpeed: '0 km/h • Esperando empaque',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'EN_CAMINO':
      case 'EN_RUTA':
        return {
          progress: 58,
          stepIndex: 3,
          statusTitle: '4. ¡En Camino a tu Domicilio!',
          statusSubtitle: `Tu pedido va en trayecto por la ruta hacia ${order.data.cliente.direccion_entrega} (${order.data.cliente.zona}).`,
          distanceText: `Rumbo a ${order.data.cliente.zona}`,
          etaText: '8-12 min',
          mapLabel: `En trayecto hacia ${order.data.cliente.zona}`,
          roadSpeed: '38 km/h • En ruta hacia tu comunidad',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      case 'LLEGUE_AL_DOMICILIO':
        return {
          progress: 94,
          stepIndex: 4,
          statusTitle: '5. ¡Repartidor Afuera de tu Casa!',
          statusSubtitle: 'El repartidor ya está tocando a tu puerta. Por favor ten listo tu código secreto de 4 dígitos.',
          distanceText: 'Afuera de tu puerta',
          etaText: '¡Ya llegó!',
          mapLabel: 'Afuera de tu domicilio',
          roadSpeed: '0 km/h • En tu puerta',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
      case 'ENTREGADO':
        return {
          progress: 100,
          stepIndex: 5,
          statusTitle: '6. ¡Pedido Entregado y Cerrado!',
          statusSubtitle: 'Código secreto validado exitosamente. ¡Gracias por ordenar con IBUY Coatepec!',
          distanceText: 'Entrega finalizada',
          etaText: 'Completado',
          mapLabel: 'Entrega completada y validada',
          roadSpeed: 'Finalizado',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      default:
        return {
          progress: 10,
          stepIndex: 0,
          statusTitle: 'Pedido Registrado',
          statusSubtitle: 'Coordinando logística en central IBUY.',
          distanceText: 'Coordinando',
          etaText: '25 min',
          mapLabel: 'En coordinación',
          roadSpeed: 'En espera',
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  const trackingInfo = getStatusTrackingData(order.status);
  const currentStep = trackingInfo.stepIndex;

  // 6 official status steps
  const steps = [
    { title: 'Asignado', desc: 'Central IBUY asigna repartidor', statusKey: 'ASIGNADO' as OrderStatus },
    { title: 'En Comercio', desc: 'Llegó a recoger pedido', statusKey: 'LLEGUE_AL_NEGOCIO' as OrderStatus },
    { title: 'Esperando', desc: 'Recibiendo en mostrador', statusKey: 'ESPERANDO_PEDIDO' as OrderStatus },
    { title: 'En Camino', desc: 'Rumbo directo a tu casa', statusKey: 'EN_CAMINO' as OrderStatus },
    { title: 'En Domicilio', desc: 'Afuera de tu puerta', statusKey: 'LLEGUE_AL_DOMICILIO' as OrderStatus },
    { title: '¡Entregado!', desc: 'Código validado', statusKey: 'ENTREGADO' as OrderStatus }
  ];

  const shareUrl = `${window.location.origin}/#track-${order.id}`;
  const shareText = encodeURIComponent(
    `¡Sigue mi pedido de IBUY Coatepec! 📦 Orden #${order.id} de ${order.data.pedido.establecimiento}. Conductor: ${order.repartidorAsignado || 'En camino'}. Rastreo: ${shareUrl}`
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Tracking Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-800 transition cursor-pointer shadow"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>Volver al Catálogo de Negocios</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Seguimiento Web:</span>
            <span className="font-mono font-bold text-white">#{order.id}</span>
          </div>

          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white text-xs border border-emerald-500/30 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir Ruta</span>
          </a>
        </div>
      </div>

      {/* PROMINENT SECURITY CODE CARD FOR THE CLIENT */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/60 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🔐 Código Secreto de Entrega
              </span>
              <span className="text-xs text-slate-400">Obligatorio al recibir</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Dile este código de 4 dígitos a tu repartidor cuando toque tu puerta para que pueda validar y cerrar la entrega en su app:
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-6 py-2.5 rounded-2xl border-2 border-emerald-400 text-center shadow-lg shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Tu Código:</span>
          <span className="font-mono font-black text-2xl tracking-widest text-emerald-400">
            #{order.codigoEntregaCliente || '4821'}
          </span>
        </div>
      </div>

      {/* STAR RATING BANNER WHEN ORDER IS DELIVERED */}
      {order.status === 'ENTREGADO' && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/40 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⭐ Calificación de Entrega
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">¡Tu pedido ha llegado!</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  ¿Cómo calificarías al repartidor y al comercio?
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsRatingModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              <Star className="w-4 h-4 fill-current" />
              <span>{order.calificacion ? 'Modificar Calificación' : 'Calificar con Estrellas ⭐'}</span>
            </button>
          </div>

          {order.calificacion && (
            <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Bike className="w-4 h-4" />
                <span>Repartidor ({order.repartidorAsignado || 'Chofer'}): {order.calificacion.estrellasRepartidor} ⭐</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                <Store className="w-4 h-4" />
                <span>Comercio ({order.data.pedido.establecimiento}): {order.calificacion.estrellasNegocio} ⭐</span>
              </div>
              {order.calificacion.comentarioRepartidor && (
                <span className="text-slate-400 italic text-[11px] truncate max-w-sm">
                  "{order.calificacion.comentarioRepartidor}"
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* REPARTIDOR RECENT MESSAGE TO CLIENT BANNER */}
      {order.mensajesRepartidor && order.mensajesRepartidor.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/20 via-slate-900 to-orange-500/10 border border-orange-500/40 flex items-start gap-3 animate-fadeIn">
          <div className="p-2 rounded-xl bg-orange-500 text-slate-950 shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <strong className="text-orange-400 text-xs font-black">
                Mensaje de tu repartidor ({order.repartidorAsignado || 'Chofer'}):
              </strong>
              <span className="text-[10px] text-slate-500 font-mono">
                {order.mensajesRepartidor[order.mensajesRepartidor.length - 1].timestamp}
              </span>
            </div>
            <p className="text-white text-xs mt-0.5 font-medium">
              "{order.mensajesRepartidor[order.mensajesRepartidor.length - 1].texto}"
            </p>
          </div>
        </div>
      )}

      {/* Main Live Tracking Visual Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Banner with Status */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/60 backdrop-blur border border-white/20`}>
                  {trackingInfo.statusTitle}
                </span>
                <span className="text-xs text-orange-100 font-bold font-mono">
                  {order.data.cliente.zona} ({zoneInfo?.rangoTarifa})
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {order.status === 'ENTREGADO'
                  ? '¡Tu pedido ha llegado a tu puerta!'
                  : order.status === 'LLEGUE_AL_DOMICILIO'
                  ? 'Tu repartidor ya está afuera de tu casa'
                  : order.status === 'EN_CAMINO' || order.status === 'EN_RUTA'
                  ? 'Tu repartidor va en camino por la ruta'
                  : order.status === 'ESPERANDO_PEDIDO'
                  ? 'Repartidor esperando tu pedido en mostrador'
                  : order.status === 'LLEGUE_AL_NEGOCIO'
                  ? 'Repartidor en el establecimiento'
                  : 'Repartidor asignado en camino al negocio'}
              </h2>
              <p className="text-xs sm:text-sm text-orange-100/90 mt-1 max-w-lg leading-relaxed">
                {trackingInfo.statusSubtitle}
              </p>
            </div>

            {/* Status-Driven ETA Pill */}
            <div className="bg-slate-950/75 backdrop-blur border border-white/20 rounded-3xl p-4 text-center min-w-[150px] shrink-0 shadow-2xl">
              <span className="text-[10px] uppercase font-black tracking-wider text-orange-300 block">
                Tiempo Estimado
              </span>
              <span className="text-2xl font-black font-mono text-white block mt-0.5">
                {order.status === 'ENTREGADO' ? '0 min' : trackingInfo.etaText}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                {trackingInfo.distanceText}
              </span>
            </div>
          </div>
        </div>

        {/* Informative Explanation Bar: Representative Map */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-[11px]">
              <strong className="text-white">Mapa Representativo de Ruta:</strong> El icono se posiciona según el <strong>estatus oficial</strong> reportado por el repartidor desde su app.
            </span>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
            Zona de Entrega: {order.data.cliente.zona} (${order.data.pedido.costo_envio} MXN)
          </span>
        </div>

        {/* Representative Map Route Display (Store to Customer Destination in Coatepec) */}
        <div className="relative h-80 sm:h-96 bg-slate-950 border-b border-slate-800 overflow-hidden">
          {/* Topographic Road Grid Overlay (Illustrative Region Grid) */}
          <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="road-grid" width="45" height="45" patternUnits="userSpaceOnUse">
                <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#334155" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#road-grid)" />
            {/* Primary road avenues representing regional connections */}
            <path d="M 40 220 Q 240 60 500 160 T 820 200" fill="none" stroke="#475569" strokeWidth="14" strokeLinecap="round" />
            <path d="M 40 220 Q 240 60 500 160 T 820 200" fill="none" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
            <path d="M 160 320 Q 380 200 620 280 T 850 120" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
            <path d="M 440 20 L 460 380" fill="none" stroke="#334155" strokeWidth="6" />
          </svg>

          {/* Representative Delivery Route Curve connecting Store to Destination */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M 110 240 Q 300 70 540 180 T 780 140"
              fill="none"
              stroke="#f97316"
              strokeWidth="5"
              strokeDasharray="10 8"
              className={order.status === 'EN_CAMINO' || order.status === 'EN_RUTA' ? 'animate-pulse' : ''}
            />
          </svg>

          {/* POINT A: STORE LOCATION */}
          <div className="absolute left-[13%] top-[62%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition ${
              currentStep <= 2 
                ? 'bg-orange-500 border-2 border-white text-slate-950 scale-110 shadow-orange-500/50' 
                : 'bg-slate-900 border-2 border-slate-700 text-slate-400'
            }`}>
              <Store className="w-6 h-6" />
            </div>
            <div className="mt-1.5 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-slate-700 text-[10px] font-extrabold text-white shadow-lg whitespace-nowrap">
              {order.data.pedido.establecimiento}
            </div>
            <span className="text-[9px] text-orange-400 font-mono">Punto de Recogida</span>
          </div>

          {/* POINT B: CLIENT DOMICILE DESTINATION */}
          <div className="absolute right-[13%] top-[34%] translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition ${
              currentStep >= 4 
                ? 'bg-emerald-500 border-2 border-white text-slate-950 scale-110 shadow-emerald-500/50 animate-bounce' 
                : 'bg-slate-900 border-2 border-slate-700 text-slate-400'
            }`}>
              <MapPin className="w-6 h-6" />
            </div>
            <div className="mt-1.5 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-slate-700 text-[10px] font-extrabold text-emerald-400 shadow-lg whitespace-nowrap flex items-center gap-1">
              <span>Tu Domicilio</span>
              <span className="text-white">({order.data.cliente.zona})</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono truncate max-w-[180px]">
              {order.data.cliente.direccion_entrega}
            </span>
          </div>

          {/* MOTORCYCLE ICON (Positioned strictly along route based on status progress) */}
          {order.status !== 'ENTREGADO' ? (
            <div 
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out flex flex-col items-center z-20"
              style={{
                left: `${14 + (trackingInfo.progress * 0.72)}%`,
                top: `${62 - (Math.sin((trackingInfo.progress / 100) * Math.PI) * 28)}%`
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border-2 border-orange-400 text-orange-400 flex items-center justify-center shadow-2xl shadow-orange-500/50">
                  <Bike className={`w-6 h-6 ${order.status === 'EN_CAMINO' ? 'animate-bounce' : ''}`} />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
              </div>
              <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-[10px] font-bold text-white shadow whitespace-nowrap flex items-center gap-1">
                <span>{order.repartidorAsignado ? order.repartidorAsignado.split(' ')[0] : 'Repartidor'}</span>
                <span className="text-orange-400">• {trackingInfo.roadSpeed}</span>
              </div>
            </div>
          ) : (
            <div className="absolute right-[13%] top-[34%] translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-ping" />
            </div>
          )}
        </div>

        {/* 6-Step Visual Delivery Stepper (Reflecting Driver's Status Flow) */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {steps.map((st, idx) => {
              const isDone = currentStep > idx;
              const isCurrent = currentStep === idx;
              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-2xl border text-center transition ${
                    isCurrent 
                      ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-950 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full mx-auto flex items-center justify-center mb-1.5 font-mono text-[11px] font-bold border">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className={isCurrent ? 'text-orange-400 font-black' : 'text-slate-500'}>{idx + 1}</span>
                    )}
                  </div>
                  <strong className="block text-xs truncate">{st.title}</strong>
                  <span className="text-[10px] block opacity-75 truncate">{st.desc}</span>
                </div>
              );
            })}
          </div>

          {/* DEMO / TESTING QUICK STATUS ADVANCE CONTROLS */}
          {onAdvanceStatus && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Simulador de Estatus de Repartidor (Demo):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {steps.map((s, i) => (
                  <button
                    key={s.statusKey}
                    onClick={() => onAdvanceStatus(order.id, s.statusKey)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                      order.status === s.statusKey
                        ? 'bg-orange-500 text-slate-950 border-orange-400'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    {i + 1}. {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Courier Info Bar */}
        {order.repartidorAsignado && (
          <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-base text-white">
                  {order.repartidorAsignado.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-base">{order.repartidorAsignado}</h4>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ⭐ 4.9 • Conductor Oficial IBUY
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <Bike className="w-3.5 h-3.5 text-orange-400" />
                  <span>{order.repartidorVehiculo || 'Moto Italika FT150'}</span>
                  {order.repartidorPlacas && (
                    <span className="font-mono text-slate-500">[{order.repartidorPlacas}]</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {order.repartidorTelefono && (
                <>
                  <a
                    href={`tel:${order.repartidorTelefono}`}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Llamar</span>
                  </a>

                  <a
                    href={`https://wa.me/52${order.repartidorTelefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hola ${order.repartidorAsignado}, soy el cliente de la orden #${order.id} en ${order.data.cliente.direccion_entrega}. Estoy siguiendo el recorrido por el mapa web de IBUY.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        {/* Order Breakdown & Receipt Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Items Summary */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-400" />
              <span>Resumen de tu Pedido</span>
            </h4>

            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                <Store className="w-3.5 h-3.5 text-orange-400" />
                <span>{order.data.pedido.establecimiento}</span>
              </div>

              {order.data.pedido.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-300">
                  <span>
                    <strong className="text-orange-400">{item.cantidad}x</strong> {item.producto}
                  </span>
                  {item.notas && <span className="text-slate-500 text-[10px]">({item.notas})</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Detalle de Pago & Entrega</span>
            </h4>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
              <div className="flex justify-between text-slate-400">
                <span>Dirección de Entrega:</span>
                <span className="font-semibold text-slate-200 text-right truncate max-w-[200px]">
                  {order.data.cliente.direccion_entrega}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Zona Territorial:</span>
                <span className="text-orange-400 font-bold">{order.data.cliente.zona}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Método de Pago:</span>
                <span className="font-bold text-emerald-400">{order.data.pedido.metodo_pago}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal productos:</span>
                  <span className="font-mono text-slate-300">${order.data.pedido.subtotal_estimado} MXN</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Costo de envío ({order.data.cliente.zona}):</span>
                  <span className="font-mono text-emerald-400">${order.data.pedido.costo_envio} MXN</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800/80">
                  <span>Total a Pagar:</span>
                  <span className="font-mono text-emerald-400">${order.data.pedido.total_estimado} MXN</span>
                </div>
              </div>

              {order.data.pedido.cambio_para > 0 && (
                <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 font-medium">
                  💵 El repartidor lleva cambio para billete de ${order.data.pedido.cambio_para} MXN
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <RatingModal
          isOpen={isRatingModalOpen}
          order={order}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmitRating={(orderId, rating) => {
            if (onSubmitRating) {
              onSubmitRating(orderId, rating);
            }
          }}
        />
      )}
    </div>
  );
};
