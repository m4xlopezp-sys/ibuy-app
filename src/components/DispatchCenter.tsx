import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Bike, 
  Phone, 
  DollarSign, 
  Filter, 
  Search, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Send,
  UserCheck,
  Navigation,
  Radio,
  Zap,
  ShieldCheck,
  Eye,
  RotateCcw
} from 'lucide-react';
import { DispatchedOrder, OrderStatus, Courier, ZonaId } from '../types/ibuy';
import { ZONAS_COATEPEC } from '../data/ibuyData';

interface DispatchCenterProps {
  orders: DispatchedOrder[];
  couriers: Courier[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAssignCourier: (orderId: string, courierName: string, courierPhone: string) => void;
  onAutoAssignNearest?: (orderId: string) => void;
}

export const DispatchCenter: React.FC<DispatchCenterProps> = ({
  orders,
  couriers,
  onUpdateOrderStatus,
  onAssignCourier,
  onAutoAssignNearest
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'gps_map' | 'metrics'>('orders');
  const [filterZone, setFilterZone] = useState<string>('TODAS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<DispatchedOrder | null>(orders[0] || null);

  const filteredOrders = orders.filter((order) => {
    if (filterZone !== 'TODAS' && order.data.cliente.zona !== filterZone) return false;
    if (filterStatus !== 'TODOS' && order.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClient = order.data.cliente.direccion_entrega.toLowerCase().includes(q) || (order.data.cliente.nombre && order.data.cliente.nombre.toLowerCase().includes(q));
      const matchStore = order.data.pedido.establecimiento.toLowerCase().includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      if (!matchClient && !matchStore && !matchId) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'VALIDANDO_STOCK':
        return {
          label: 'Validando Stock',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400'
        };
      case 'ASIGNADO':
        return {
          label: 'Repartidor Asignado',
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400'
        };
      case 'LLEGUE_AL_NEGOCIO':
        return {
          label: '1. En Comercio',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400'
        };
      case 'ESPERANDO_PEDIDO':
        return {
          label: '2. Esperando Empaque',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400'
        };
      case 'EN_CAMINO':
      case 'EN_RUTA':
        return {
          label: '3. En Camino',
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400'
        };
      case 'LLEGUE_AL_DOMICILIO':
        return {
          label: '4. Afuera del Domicilio',
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          dot: 'bg-cyan-400'
        };
      case 'ENTREGADO':
        return {
          label: '5. Entregado con Código',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400'
        };
      default:
        return {
          label: 'Pendiente',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  const handleSmartAssign = (orderId: string) => {
    const available = couriers.filter(c => c.estado === 'DISPONIBLE');
    const chosen = available.length > 0 ? available[0] : couriers[0];
    onAssignCourier(orderId, chosen.nombre, chosen.telefono);
  };

  const generateWhatsAppMessage = (order: DispatchedOrder) => {
    const text = `*IBUY COATEPEC DE HARINAS - TICKET DE PEDIDO*\n` +
      `📦 *Orden:* #${order.id}\n` +
      `🏪 *Establecimiento:* ${order.data.pedido.establecimiento}\n` +
      `📍 *Entrega:* ${order.data.cliente.direccion_entrega} (${order.data.cliente.zona})\n` +
      `📝 *Items:* ${order.data.pedido.items.map(i => `${i.cantidad}x ${i.producto}`).join(', ')}\n` +
      `💰 *Subtotal:* $${order.data.pedido.subtotal_estimado} MXN\n` +
      `🛵 *Tarifa Envío:* $${order.data.pedido.costo_envio} MXN\n` +
      `💵 *Total:* $${order.data.pedido.total_estimado} MXN\n` +
      (order.data.pedido.cambio_para > 0 ? `⚠️ *Llevar cambio para:* $${order.data.pedido.cambio_para} MXN\n` : '') +
      `🛵 *Repartidor Asignado:* ${order.repartidorAsignado || 'Por asignar'}`;

    return encodeURIComponent(text);
  };

  // KPIs
  const totalSales = orders.reduce((acc, o) => acc + o.data.pedido.total_estimado, 0);
  const totalShipping = orders.reduce((acc, o) => acc + o.data.pedido.costo_envio, 0);
  const activeOrders = orders.filter(o => o.status !== 'ENTREGADO').length;

  return (
    <div className="space-y-6">
      {/* Top Operations Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xl bg-orange-500/20 text-orange-400">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Torre de Despacho & Rastreo GPS de Flotilla
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Panel de administrador para monitorear órdenes en tiempo real, asignar repartidores y rastrear motos por GPS.
          </p>
        </div>

        {/* View Switcher: Orders List vs Live GPS Map */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'orders'
                  ? 'bg-orange-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Lista de Pedidos ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('gps_map')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'gps_map'
                  ? 'bg-orange-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Rastreo GPS en Vivo</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Pedidos Activos en Curso</span>
          <span className="text-2xl font-black font-mono text-orange-400">{activeOrders}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Ventas Totales (GMV)</span>
          <span className="text-2xl font-black font-mono text-emerald-400">${totalSales.toLocaleString()} MXN</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Tarifas de Envío Generadas</span>
          <span className="text-2xl font-black font-mono text-blue-400">${totalShipping.toLocaleString()} MXN</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Repartidores en Línea</span>
          <span className="text-2xl font-black font-mono text-white">
            {couriers.filter(c => c.estado === 'DISPONIBLE').length} / {couriers.length}
          </span>
        </div>
      </div>

      {/* Subtab: Live GPS Fleet Tracking Map */}
      {activeSubTab === 'gps_map' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Radar GPS en Vivo: Coatepec de Harinas & Comunidades</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ubicación satelital simulada de los repartidores y órdenes en trayecto.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Disponible
              </span>
              <span className="flex items-center gap-1.5 text-orange-400 font-semibold ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" /> En Reparto
              </span>
            </div>
          </div>

          {/* Interactive Map Canvas Container */}
          <div className="relative h-96 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Grid & Topographic lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="admin-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#64748b" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#admin-grid)" />
              {/* Regional roads connecting Meyuca, Tepehuajes, Tonatico */}
              <path d="M 100 200 L 450 180 L 800 280" fill="none" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
              <path d="M 450 40 L 450 360" fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
              <path d="M 250 100 Q 450 180 650 320" fill="none" stroke="#475569" strokeWidth="4" />
            </svg>

            {/* Geographical Markers */}
            <div className="absolute left-[45%] top-[45%] -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-xl text-[11px] font-bold text-white shadow">
              🏛️ Cabecera Municipal (Centro)
            </div>

            <div className="absolute left-[20%] top-[30%] -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded-lg text-[10px] text-slate-300">
              📍 Meyuca de Morelos (Zona 3)
            </div>

            <div className="absolute right-[25%] top-[20%] -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded-lg text-[10px] text-slate-300">
              📍 Tepehuajes (Zona 3)
            </div>

            <div className="absolute left-[30%] bottom-[25%] -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded-lg text-[10px] text-slate-300">
              📍 Zacango (Zona 2)
            </div>

            <div className="absolute right-[15%] bottom-[15%] -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded-lg text-[10px] text-slate-300">
              📍 Ixtapan / Tonatico (Zona 4)
            </div>

            {/* Couriers Active on the Map */}
            {couriers.map((c, idx) => {
              const positions = [
                { left: '46%', top: '48%' }, // Luis Centro
                { left: '26%', top: '35%' }, // Javier Meyuca
                { left: '72%', top: '70%' }, // Mateo Ixtapan
                { left: '33%', top: '65%' }, // Sofia Zacango
                { left: '42%', top: '55%' }  // Raul March
              ];
              const pos = positions[idx % positions.length];
              const isEnReparto = c.estado === 'EN_REPARTO';

              return (
                <div
                  key={c.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  style={{ left: pos.left, top: pos.top }}
                >
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl transition transform group-hover:scale-110 ${
                      isEnReparto
                        ? 'bg-orange-500 border-2 border-white ring-4 ring-orange-500/30'
                        : 'bg-emerald-600 border-2 border-slate-900'
                    }`}>
                      <Bike className="w-5 h-5" />
                    </div>
                    {isEnReparto && (
                      <span className="w-3 h-3 bg-orange-400 rounded-full border-2 border-slate-950 absolute -top-1 -right-1 animate-ping" />
                    )}
                  </div>

                  <div className="mt-1 px-2 py-0.5 rounded-lg bg-slate-950/95 border border-slate-800 text-[10px] font-bold text-white shadow whitespace-nowrap">
                    {c.nombre.split(' ')[0]} ({c.vehiculo})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Fleet Dispatch Table below map */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {couriers.map((courier) => (
              <div
                key={courier.id}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{courier.nombre}</span>
                    <span className="text-[10px] text-amber-400 font-mono">⭐ {courier.calificacion}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {courier.modeloVehiculo} • {courier.ubicacionActual}
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  courier.estado === 'DISPONIBLE'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  {courier.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab: Orders Management & Dispatching */}
      {activeSubTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Orders Cards List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar cliente, comercio o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="TODAS">Todas las Zonas</option>
                <option value="Zona 1">Zona 1: Cabecera ($25)</option>
                <option value="Zona 2">Zona 2: Periférica ($35-$45)</option>
                <option value="Zona 3">Zona 3: Rancherías ($50-$70)</option>
                <option value="Zona 4">Zona 4: Municipios ($80-$120)</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="ASIGNADO">1. Asignado</option>
                <option value="LLEGUE_AL_NEGOCIO">2. En Comercio</option>
                <option value="ESPERANDO_PEDIDO">3. Esperando Pedido</option>
                <option value="EN_CAMINO">4. En Camino</option>
                <option value="LLEGUE_AL_DOMICILIO">5. Afuera Domicilio</option>
                <option value="ENTREGADO">6. Entregado</option>
              </select>
            </div>

            {/* List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300">No hay órdenes con los filtros seleccionados</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Entra al modo "Cliente" para ordenar o usa el "Asistente WhatsApp" para procesar pedidos.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-3xl border transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-orange-500 shadow-xl shadow-orange-500/10'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Left accent color bar by zone */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      order.data.cliente.zona === 'Zona 1'
                        ? 'bg-emerald-500'
                        : order.data.cliente.zona === 'Zona 2'
                        ? 'bg-blue-500'
                        : order.data.cliente.zona === 'Zona 3'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`} />

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-300">#{order.id}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{order.createdAt}</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Comercio / Origen</div>
                        <div className="font-bold text-white text-sm">
                          {order.data.pedido.establecimiento}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {order.data.pedido.items.length} item(s): {order.data.pedido.items.map(i => `${i.cantidad}x ${i.producto}`).join(', ')}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Destino & Zona</div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                          <span className="truncate">{order.data.cliente.direccion_entrega}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                          <span>{order.data.cliente.zona}:</span>
                          <strong className="text-emerald-400 font-mono">${order.data.pedido.costo_envio} MXN</strong>
                        </div>
                      </div>
                    </div>

                    {/* Footer & Quick Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Bike className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-slate-400 text-[11px]">
                          Repartidor: <strong className="text-white">{order.repartidorAsignado || 'Sin asignar'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="font-mono font-bold text-white">
                          Total: <span className="text-emerald-400">${order.data.pedido.total_estimado} MXN</span>
                        </div>
                        {!order.repartidorAsignado && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSmartAssign(order.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Auto-Asignar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Order Detail & Actions Modal/Card (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl h-fit sticky top-24">
            {selectedOrder ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Gestión de Orden</span>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>Orden #{selectedOrder.id}</span>
                    </h3>
                  </div>

                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedOrder.status).bg}`}>
                    {getStatusBadge(selectedOrder.status).label}
                  </div>
                </div>

                {/* Status workflow stepper */}
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">Actualizar Estado:</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, 'ASIGNADO')}
                      className={`p-2 rounded-xl border text-[10px] font-semibold text-center transition ${
                        selectedOrder.status === 'ASIGNADO'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      1. Asignado
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, 'LLEGUE_AL_NEGOCIO')}
                      className={`p-2 rounded-xl border text-[10px] font-semibold text-center transition ${
                        selectedOrder.status === 'LLEGUE_AL_NEGOCIO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      2. En Tienda
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, 'ESPERANDO_PEDIDO')}
                      className={`p-2 rounded-xl border text-[10px] font-semibold text-center transition ${
                        selectedOrder.status === 'ESPERANDO_PEDIDO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      3. Esperando
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, 'EN_CAMINO')}
                      className={`p-2 rounded-xl border text-[10px] font-semibold text-center transition ${
                        selectedOrder.status === 'EN_CAMINO' || selectedOrder.status === 'EN_RUTA'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      4. En Camino
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, 'LLEGUE_AL_DOMICILIO')}
                      className={`p-2 rounded-xl border text-[10px] font-semibold text-center transition ${
                        selectedOrder.status === 'LLEGUE_AL_DOMICILIO'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      5. En Puerta
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, 'ENTREGADO')}
                      className={`p-2 rounded-xl border text-[10px] font-semibold text-center transition ${
                        selectedOrder.status === 'ENTREGADO'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      6. Entregado
                    </button>
                  </div>
                </div>

                {/* Assign Courier Dropdown */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                    <span className="flex items-center gap-1 text-orange-400">
                      <Bike className="w-3.5 h-3.5" />
                      Asignar a Repartidor
                    </span>
                    <button
                      onClick={() => handleSmartAssign(selectedOrder.id)}
                      className="text-orange-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      Auto-Asignar
                    </button>
                  </div>

                  <select
                    value={selectedOrder.repartidorAsignado || ''}
                    onChange={(e) => {
                      const c = couriers.find(courier => courier.nombre === e.target.value);
                      if (c) {
                        onAssignCourier(selectedOrder.id, c.nombre, c.telefono);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Seleccionar repartidor...</option>
                    {couriers.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre} • {c.vehiculo} ({c.modeloVehiculo}) • ⭐ {c.calificacion} ({c.estado})
                      </option>
                    ))}
                  </select>

                  {selectedOrder.repartidorAsignado && (
                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-900">
                      <span>Contacto Repartidor:</span>
                      <a
                        href={`https://wa.me/52${selectedOrder.repartidorTelefono?.replace(/\D/g, '')}?text=${generateWhatsAppMessage(selectedOrder)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        <Phone className="w-3 h-3" />
                        {selectedOrder.repartidorTelefono || 'WhatsApp'}
                      </a>
                    </div>
                  )}
                </div>

                {/* Items Detail */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Artículos Solicitados:</div>
                  <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-2">
                    {selectedOrder.data.pedido.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-200">
                          <strong className="text-orange-400">{item.cantidad}x</strong> {item.producto}
                        </span>
                        {item.notas && <span className="text-slate-500 text-[10px]">Nota: {item.notas}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financials Breakdown */}
                <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Comercio:</span>
                    <span className="font-mono text-slate-200">${selectedOrder.data.pedido.subtotal_estimado} MXN</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Costo Envío ({selectedOrder.data.cliente.zona}):</span>
                    <span className="font-mono text-emerald-400">${selectedOrder.data.pedido.costo_envio} MXN</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
                    <span>Total a Cobrar:</span>
                    <span className="font-mono text-emerald-400">${selectedOrder.data.pedido.total_estimado} MXN</span>
                  </div>
                  {selectedOrder.data.pedido.cambio_para > 0 && (
                    <div className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      💵 Repartidor debe llevar cambio para: ${selectedOrder.data.pedido.cambio_para} MXN
                    </div>
                  )}
                </div>

                {/* External WhatsApp Ticket Dispatch Button */}
                <a
                  href={`https://wa.me/?text=${generateWhatsAppMessage(selectedOrder)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Ticket de Asignación por WhatsApp</span>
                </a>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">Selecciona un pedido de la lista para ver opciones de asignación y rastreo.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
