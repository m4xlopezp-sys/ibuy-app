import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Store, 
  DollarSign, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Navigation, 
  AlertTriangle, 
  Radio, 
  KeyRound,
  Send,
  Clock,
  ShieldCheck,
  Boxes,
  ArrowRight,
  ExternalLink,
  Star,
  Receipt,
  FileCheck2,
  Calendar,
  X
} from 'lucide-react';
import { DispatchedOrder, Courier, OrderStatus, UserSession } from '../types/ibuy';

interface DriverAppProps {
  orders: DispatchedOrder[];
  couriers: Courier[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onSendDriverMessage?: (orderId: string, texto: string) => void;
  onCloseDay?: (driverId: string, summary: { totalPedidos: number; totalEfectivo: number; totalGananciasTarifas: number; horaCierre: string }) => void;
  currentSession: UserSession;
  onLogout?: () => void;
}

export const DriverApp: React.FC<DriverAppProps> = ({
  orders,
  couriers,
  onUpdateOrderStatus,
  onSendDriverMessage,
  onCloseDay,
  currentSession,
  onLogout
}) => {
  const [activeDriverTab, setActiveDriverTab] = useState<'activos' | 'historial'>('activos');
  const [clientCodeInput, setClientCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageSentToast, setMessageSentToast] = useState(false);

  // Close Day Modal
  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
  const [dayClosedToast, setDayClosedToast] = useState(false);

  // Active driver profile
  const activeDriver = couriers.find(
    c => c.id === currentSession.courierId || c.telefono === currentSession.identificador || c.nombre === currentSession.nombre
  ) || couriers[0];

  // Active orders assigned to this driver
  const myAssignedOrders = orders.filter(
    o => (o.repartidorAsignado === activeDriver.nombre || o.repartidorTelefono === activeDriver.telefono) && o.status !== 'ENTREGADO'
  );

  // Completed deliveries for this driver
  const myCompletedOrders = orders.filter(
    o => (o.repartidorAsignado === activeDriver.nombre || o.repartidorTelefono === activeDriver.telefono) && o.status === 'ENTREGADO'
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    myAssignedOrders[0]?.id || ''
  );

  const assignedOrder = myAssignedOrders.find(o => o.id === selectedOrderId) || myAssignedOrders[0];

  // Totals for Close Day Calculation
  const totalEfectivoCobrado = myCompletedOrders.reduce((sum, o) => {
    return o.data.pedido.metodo_pago === 'Efectivo' ? sum + o.data.pedido.total_estimado : sum;
  }, 0);

  const totalGananciasTarifas = myCompletedOrders.reduce((sum, o) => {
    return sum + o.data.pedido.costo_envio;
  }, 0);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !assignedOrder) return;
    if (onSendDriverMessage) {
      onSendDriverMessage(assignedOrder.id, messageInput.trim());
    }
    setMessageInput('');
    setShowMessageBox(false);
    setMessageSentToast(true);
    setTimeout(() => setMessageSentToast(false), 3000);
  };

  const handleSendQuickMessage = (msg: string) => {
    if (!assignedOrder) return;
    if (onSendDriverMessage) {
      onSendDriverMessage(assignedOrder.id, msg);
    }
    setMessageSentToast(true);
    setTimeout(() => setMessageSentToast(false), 3000);
  };

  const handleCloseOrderWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedOrder) return;

    const expectedCode = (assignedOrder.codigoEntregaCliente || '4821').trim();
    if (clientCodeInput.trim() === expectedCode) {
      setCodeSuccess(true);
      setCodeError('');
      setTimeout(() => {
        onUpdateOrderStatus(assignedOrder.id, 'ENTREGADO');
        setClientCodeInput('');
        setCodeSuccess(false);
      }, 1200);
    } else {
      setCodeError(`Código incorrecto. Pídele al cliente el código de 4 dígitos que aparece en su pantalla (Demo: ${expectedCode})`);
    }
  };

  // Close Day Execution
  const handleConfirmCloseDay = () => {
    const summary = {
      totalPedidos: myCompletedOrders.length,
      totalEfectivo: totalEfectivoCobrado,
      totalGananciasTarifas: totalGananciasTarifas,
      horaCierre: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (onCloseDay) {
      onCloseDay(activeDriver.id, summary);
    }

    setIsCloseDayModalOpen(false);
    setDayClosedToast(true);
    setTimeout(() => setDayClosedToast(false), 5000);
  };

  // Human-readable status details
  const getStatusDetail = (status: OrderStatus) => {
    switch (status) {
      case 'ASIGNADO': 
        return {
          title: 'Orden Asignada',
          desc: 'Dirígete al comercio para recoger los productos.',
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/30'
        };
      case 'LLEGUE_AL_NEGOCIO': 
        return {
          title: '1. Llegaste al Establecimiento',
          desc: 'Indica en mostrador que eres repartidor de IBUY y solicita la orden.',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30'
        };
      case 'ESPERANDO_PEDIDO': 
        return {
          title: '2. Esperando a Recibirlo',
          desc: 'El comercio está empacando o preparando los artículos.',
          color: 'text-amber-300',
          bg: 'bg-amber-500/10 border-amber-500/30'
        };
      case 'EN_CAMINO':
      case 'EN_RUTA': 
        return {
          title: '3. En Camino al Domicilio',
          desc: 'Llevas el paquete en tu vehículo hacia el cliente.',
          color: 'text-orange-400',
          bg: 'bg-orange-500/10 border-orange-500/30'
        };
      case 'LLEGUE_AL_DOMICILIO': 
        return {
          title: '4. Afuera del Domicilio',
          desc: 'Toca el timbre y solicita el código de entrega de 4 dígitos.',
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10 border-cyan-500/30'
        };
      case 'ENTREGADO': 
        return {
          title: '5. Pedido Entregado y Cerrado',
          desc: 'Código validado exitosamente. Cobro completado.',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30'
        };
      default: 
        return {
          title: 'En Proceso',
          desc: 'Pedido activo en la plataforma.',
          color: 'text-slate-300',
          bg: 'bg-slate-800 border-slate-700'
        };
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Toast Alert for Day Closed */}
      {dayClosedToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-2xl animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              ¡Día cerrado con éxito! Se ha enviado el corte de liquidación al Administrador vía WhatsApp.
            </span>
          </div>
          <button onClick={() => setDayClosedToast(false)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Driver Header Profile Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-base shadow-inner">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm">{activeDriver.nombre}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                activeDriver.estado === 'DISPONIBLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : activeDriver.estado === 'EN_REPARTO'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {activeDriver.estado === 'DESCONECTADO' ? 'Turno Cerrado' : activeDriver.estado}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeDriver.modeloVehiculo} {activeDriver.placas && `• Placas: [${activeDriver.placas}]`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Button: Cerrar Día / Corte de Caja */}
          <button
            onClick={() => setIsCloseDayModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Cerrar Día / Corte</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-[11px] text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 transition cursor-pointer font-bold"
            >
              Salir
            </button>
          )}
        </div>
      </div>

      {/* Driver Navigation Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveDriverTab('activos')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeDriverTab === 'activos'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Pedidos Asignados ({myAssignedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveDriverTab('historial')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeDriverTab === 'historial'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Historial de Entregas ({myCompletedOrders.length})</span>
        </button>
      </div>

      {/* TAB 1: PEDIDOS ACTIVOS */}
      {activeDriverTab === 'activos' && (
        <>
          {/* Multiple orders switcher if driver has more than 1 assigned */}
          {myAssignedOrders.length > 1 && (
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 font-bold px-2 shrink-0">Tus Pedidos ({myAssignedOrders.length}):</span>
              {myAssignedOrders.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    (assignedOrder && assignedOrder.id === o.id)
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  #{o.id} • {o.data.pedido.establecimiento.slice(0, 15)}...
                </button>
              ))}
            </div>
          )}

          {/* Main Delivery Card */}
          {!assignedOrder ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-purple-400">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="font-extrabold text-white text-lg">No tienes pedidos asignados en este momento</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Mantente conectado y en tu zona. El Administrador te asignará entregas en cuanto entren pedidos de los clientes por WhatsApp o por la App.
              </p>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-sm mx-auto text-left text-xs">
                <div className="font-bold text-white mb-1">Estado de tu cuenta:</div>
                <div className="text-slate-400 text-[11px] flex justify-between">
                  <span>Zona preferente:</span>
                  <strong className="text-orange-400">{activeDriver.zonaPreferente}</strong>
                </div>
                <div className="text-slate-400 text-[11px] flex justify-between">
                  <span>Calificación:</span>
                  <strong className="text-amber-400">⭐ {activeDriver.calificacion} / 5.0</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
              {/* Order Status Banner */}
              <div className={`p-4 border-b ${getStatusDetail(assignedOrder.status).bg} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-white px-2 py-0.5 rounded bg-slate-950/60 border border-white/10">
                    #{assignedOrder.id}
                  </span>
                  <span className={`text-xs font-extrabold ${getStatusDetail(assignedOrder.status).color}`}>
                    {getStatusDetail(assignedOrder.status).title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {assignedOrder.createdAt}
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* 1. DÓNDE ES (Punto de recolección y punto de entrega) */}
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                    1. Ruta y Direcciones de Entrega:
                  </span>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                    {/* Origen: Establecimiento */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5 border border-orange-500/30">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-orange-400 uppercase font-bold">Recoger en:</div>
                        <div className="font-bold text-white text-xs">
                          {assignedOrder.data.pedido.establecimiento}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Coatepec de Harinas (Centro Comercial)
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 pl-4 border-l border-dashed border-slate-800 py-1" />

                    {/* Destino: Cliente */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-emerald-400 uppercase font-bold">Entregar a cliente:</div>
                        <div className="font-bold text-white text-xs">
                          {assignedOrder.data.cliente.nombre || 'Cliente IBUY'}
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium">
                          {assignedOrder.data.cliente.direccion_entrega}
                        </div>
                        <div className="text-[10px] text-orange-400 mt-0.5 font-mono">
                          Territorio: {assignedOrder.data.cliente.zona}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CUÁNTO ES (Monto a cobrar y desglose) */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                    2. Montos de Cobro al Cliente:
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Total a Cobrar:</span>
                      <span className="text-lg font-mono font-black text-emerald-400">
                        ${assignedOrder.data.pedido.total_estimado} MXN
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {assignedOrder.data.pedido.metodo_pago}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Tarifa Repartidor:</span>
                      <span className="text-lg font-mono font-black text-orange-400">
                        ${assignedOrder.data.pedido.costo_envio} MXN
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {assignedOrder.data.cliente.zona}
                      </span>
                    </div>
                  </div>

                  {assignedOrder.data.pedido.cambio_para > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                      <DollarSign className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        <strong>¡Atención cambio!</strong> El cliente paga con billete de <strong>${assignedOrder.data.pedido.cambio_para} MXN</strong> (dar ${assignedOrder.data.pedido.cambio_para - assignedOrder.data.pedido.total_estimado} de cambio).
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. BOTONES DE ACCIÓN PARA ACTUALIZAR ESTATUS */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                    3. Notificar Avance de Entrega en Ruta:
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(assignedOrder.id, 'LLEGUE_AL_NEGOCIO')}
                      className={`p-3 rounded-2xl text-xs font-bold border transition text-left flex items-center justify-between cursor-pointer ${
                        assignedOrder.status === 'LLEGUE_AL_NEGOCIO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-[10px] text-slate-400">Paso 1</div>
                        <div>Llegué al Comercio</div>
                      </div>
                      <Store className="w-4 h-4 text-amber-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(assignedOrder.id, 'ESPERANDO_PEDIDO')}
                      className={`p-3 rounded-2xl text-xs font-bold border transition text-left flex items-center justify-between cursor-pointer ${
                        assignedOrder.status === 'ESPERANDO_PEDIDO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-[10px] text-slate-400">Paso 2</div>
                        <div>Esperando Pedido</div>
                      </div>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(assignedOrder.id, 'EN_CAMINO')}
                      className={`p-3 rounded-2xl text-xs font-bold border transition text-left flex items-center justify-between cursor-pointer ${
                        assignedOrder.status === 'EN_CAMINO' || assignedOrder.status === 'EN_RUTA'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-[10px] text-slate-400">Paso 3</div>
                        <div>En Camino a Casa</div>
                      </div>
                      <Bike className="w-4 h-4 text-purple-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(assignedOrder.id, 'LLEGUE_AL_DOMICILIO')}
                      className={`p-3 rounded-2xl text-xs font-bold border transition text-left flex items-center justify-between cursor-pointer ${
                        assignedOrder.status === 'LLEGUE_AL_DOMICILIO'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-[10px] text-slate-400">Paso 4</div>
                        <div>Afuera del Domicilio</div>
                      </div>
                      <MapPin className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                </div>

                {/* 4. COMUNICACIÓN CON EL CLIENTE */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">
                      4. Avisos y Contacto con el Cliente:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMessageBox(!showMessageBox)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
                    >
                      {showMessageBox ? 'Ocultar chat' : '+ Escribir mensaje'}
                    </button>
                  </div>

                  {/* Quick message buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500">Enviar aviso rápido con un clic:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSendQuickMessage('Ya estoy en el negocio esperando que me entreguen tus productos.')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-200 border border-slate-800 transition cursor-pointer font-medium"
                      >
                        💬 "Ya estoy en el negocio esperando"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendQuickMessage('Voy saliendo en moto hacia tu domicilio, llego en unos minutos.')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-200 border border-slate-800 transition cursor-pointer font-medium"
                      >
                        🛵 "Voy en moto hacia tu domicilio"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendQuickMessage('Ya estoy afuera de tu casa tocando el timbre.')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-200 border border-slate-800 transition cursor-pointer font-medium"
                      >
                        🔔 "Ya estoy afuera de tu casa"
                      </button>
                    </div>
                  </div>

                  {/* Custom message input form */}
                  {showMessageBox && (
                    <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Escribe aviso para el cliente..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* 5. CERRAR PEDIDO CON EL CÓDIGO DEL CLIENTE */}
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-950 to-emerald-950/40 border-2 border-emerald-500/50 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <KeyRound className="w-5 h-5" />
                    <span className="font-extrabold text-white text-sm">
                      5. Cerrar Pedido con Código del Cliente:
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pídele al cliente el código de 4 dígitos que aparece en su pantalla para confirmar la entrega y cerrar la orden.
                  </p>

                  <form onSubmit={handleCloseOrderWithCode} className="space-y-2.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Código de 4 dígitos..."
                        value={clientCodeInput}
                        onChange={(e) => {
                          setClientCodeInput(e.target.value);
                          setCodeError('');
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-center tracking-widest font-black text-base focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={!clientCodeInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        Validar & Cerrar
                      </button>
                    </div>

                    {codeSuccess && (
                      <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>¡Código verificado con éxito! Pedido cerrado y marcado como Entregado.</span>
                      </div>
                    )}

                    {codeError && (
                      <div className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{codeError}</span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: HISTORIAL DE ENTREGAS DEL REPARTIDOR */}
      {activeDriverTab === 'historial' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-bold text-white text-sm">Tus Entregas Finalizadas</h4>
              <p className="text-xs text-slate-400">
                Resumen de pedidos entregados y valoraciones recibidas de los clientes.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 font-mono">
              <span className="text-slate-400">Total Ganado en Envíos:</span>
              <strong className="text-emerald-400 font-bold">${totalGananciasTarifas} MXN</strong>
            </div>
          </div>

          {myCompletedOrders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-sm">No tienes entregas completadas en este turno</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                A medida que entregues órdenes con el código secreto del cliente, se registrarán aquí con su comprobante de pago.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myCompletedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">#{ord.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Entregado
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs text-slate-400">Tarifa: </span>
                      <span className="text-sm font-bold text-emerald-400">
                        ${ord.data.pedido.costo_envio} MXN
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-orange-400" />
                      <span>{ord.data.pedido.establecimiento}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ord.data.cliente.direccion_entrega} ({ord.data.cliente.zona})</span>
                    </div>
                  </div>

                  {/* Customer Star Rating if available */}
                  {ord.calificacion && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>Calificación del Cliente: {ord.calificacion.estrellasRepartidor} / 5</span>
                      </div>
                      {ord.calificacion.comentarioRepartidor && (
                        <span className="text-[11px] text-slate-400 italic truncate max-w-xs">
                          "{ord.calificacion.comentarioRepartidor}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CORTE Y CIERRE DE DÍA */}
      {isCloseDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsCloseDayModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-400 mb-1">
                <FileCheck2 className="w-4 h-4" />
                <span>LIQUIDACIÓN & CORTE DE JORNADA</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Cerrar Día de {activeDriver.nombre}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Al confirmar, se generará una notificación automática por WhatsApp al Administrador con tu reporte final.
              </p>
            </div>

            {/* Breakdown box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Pedidos Entregados Hoy:</span>
                <span className="font-bold text-white font-mono">{myCompletedOrders.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Efectivo Cobrado (A liquidar en central):</span>
                <span className="font-bold text-amber-400 font-mono">${totalEfectivoCobrado} MXN</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ganancia por Tarifas de Envío:</span>
                <span className="font-bold text-emerald-400 font-mono">${totalGananciasTarifas} MXN</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400">
                <span>Hora del Corte:</span>
                <span className="font-bold text-slate-200 font-mono">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hrs
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCloseDayModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseDay}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cerrar Turno & Notificar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
