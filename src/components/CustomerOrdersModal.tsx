import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Store, 
  Bike, 
  X, 
  Receipt, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Package
} from 'lucide-react';
import { DispatchedOrder, UserSession, CalificacionPedido } from '../types/ibuy';
import { RatingModal } from './RatingModal';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: DispatchedOrder[];
  currentSession: UserSession;
  onOpenTracking: (orderId: string) => void;
  onSubmitRating: (orderId: string, rating: CalificacionPedido) => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentSession,
  onOpenTracking,
  onSubmitRating
}) => {
  const [activeTab, setActiveTab] = useState<'en_proceso' | 'historial'>('en_proceso');
  const [ratingOrder, setRatingOrder] = useState<DispatchedOrder | null>(null);

  if (!isOpen) return null;

  // Filter orders related to this customer (by phone or name, or all demo orders if no exact match)
  const customerPhoneClean = (currentSession.identificador || '').replace(/\D/g, '');
  const customerNameLower = (currentSession.nombre || '').toLowerCase();

  const myOrders = orders.filter((o) => {
    const oPhone = (o.data.cliente.telefono || '').replace(/\D/g, '');
    const oName = (o.data.cliente.nombre || '').toLowerCase();
    
    // Match phone or name
    if (customerPhoneClean && oPhone && (customerPhoneClean.includes(oPhone) || oPhone.includes(customerPhoneClean))) {
      return true;
    }
    if (customerNameLower && oName && (oName.includes(customerNameLower) || customerNameLower.includes(oName))) {
      return true;
    }
    // Fallback: If logged in as María Gómez or demo, show demo orders
    if (customerNameLower.includes('maría') || customerNameLower.includes('maria')) {
      return true;
    }
    return false;
  });

  // If no specific match found, fallback to all orders so user never sees empty state in demo mode
  const effectiveOrders = myOrders.length > 0 ? myOrders : orders;

  const activeOrders = effectiveOrders.filter(o => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO');
  const completedOrders = effectiveOrders.filter(o => o.status === 'ENTREGADO');

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ASIGNADO': return { text: 'Repartidor Asignado', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
      case 'LLEGUE_AL_NEGOCIO': return { text: '1. En Comercio', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
      case 'ESPERANDO_PEDIDO': return { text: '2. En Mostrador', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
      case 'EN_CAMINO':
      case 'EN_RUTA': return { text: '3. En Camino', color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' };
      case 'LLEGUE_AL_DOMICILIO': return { text: '4. En tu Puerta', color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' };
      case 'ENTREGADO': return { text: 'Entregado', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
      default: return { text: status, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-white">Mis Pedidos & Compras</h2>
                  <p className="text-xs text-slate-400">
                    Perfil de cliente: <strong className="text-slate-200">{currentSession.nombre || 'Cliente IBUY'}</strong> • {currentSession.comunidadUbicacion || 'Coatepec de Harinas'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 pt-4 pb-2">
            <button
              onClick={() => setActiveTab('en_proceso')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'en_proceso'
                  ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>En Proceso ({activeOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('historial')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'historial'
                  ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Historial de Compras ({completedOrders.length})</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
            {activeTab === 'en_proceso' ? (
              activeOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-6 space-y-3">
                  <Package className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">No tienes pedidos activos en curso</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Cuando agregues productos a tu carrito y confirmes tu orden, podrás ver aquí el seguimiento en tiempo real con mapa representativo.
                  </p>
                </div>
              ) : (
                activeOrders.map((order) => {
                  const statusInfo = getStatusText(order.status);
                  return (
                    <div
                      key={order.id}
                      className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-orange-400">
                            #{order.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{order.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-orange-400" />
                            <span>{order.data.pedido.establecimiento}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{order.data.cliente.direccion_entrega}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-emerald-400">
                            ${order.data.pedido.total_estimado} MXN
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Código PIN: <span className="font-mono font-bold text-amber-400">{order.codigoEntregaCliente}</span>
                          </div>
                        </div>
                      </div>

                      {/* Repartidor mini info */}
                      {order.repartidorAsignado && (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Bike className="w-4 h-4 text-orange-400" />
                            <div>
                              <span className="text-slate-300 font-medium">{order.repartidorAsignado}</span>
                              <span className="text-slate-500 text-[10px] block">{order.repartidorVehiculo}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onOpenTracking(order.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
                          >
                            <span>Ver Mapa y Estatus</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            ) : (
              completedOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-6 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">Aún no tienes compras finalizadas</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Tus pedidos entregados se guardarán aquí con su comprobante y podrás calificar al repartidor y al negocio con estrellas.
                  </p>
                </div>
              ) : (
                completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-300">
                          #{order.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Entregado</span>
                        </span>
                      </div>

                      <span className="font-mono text-sm font-bold text-emerald-400">
                        ${order.data.pedido.total_estimado} MXN
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-orange-400" />
                        <span>{order.data.pedido.establecimiento}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {order.data.pedido.items.map(i => `${i.cantidad}x ${i.producto}`).join(', ')}
                      </div>
                      <div className="text-slate-500 text-[10px] flex items-center gap-2">
                        <span>Repartidor: {order.repartidorAsignado || 'Oficial IBUY'}</span>
                        <span>•</span>
                        <span>{order.data.cliente.zona}</span>
                      </div>
                    </div>

                    {/* Calificación status / Button */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      {order.calificacion ? (
                        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 w-full sm:w-auto">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Bike className="w-3.5 h-3.5 text-orange-400" />
                            <span>Repartidor: {order.calificacion.estrellasRepartidor}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="flex items-center gap-1 text-purple-300 font-bold">
                            <Store className="w-3.5 h-3.5 text-purple-400" />
                            <span>Negocio: {order.calificacion.estrellasNegocio}</span>
                            <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-medium">
                          ¡Aún no has calificado esta orden!
                        </span>
                      )}

                      <button
                        onClick={() => setRatingOrder(order)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                          order.calificacion
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-slate-950 shadow-md shadow-orange-500/20'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{order.calificacion ? 'Editar Calificación' : 'Calificar Repartidor & Negocio'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Rating modal if triggered */}
      {ratingOrder && (
        <RatingModal
          isOpen={!!ratingOrder}
          order={ratingOrder}
          onClose={() => setRatingOrder(null)}
          onSubmitRating={onSubmitRating}
        />
      )}
    </>
  );
};
