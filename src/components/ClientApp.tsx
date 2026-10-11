import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Search, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Bike, 
  Sparkles, 
  CreditCard, 
  Banknote, 
  Smartphone,
  ChevronRight,
  PackageCheck,
  Navigation,
  Star,
  Tag,
  Gift,
  Compass,
  SlidersHorizontal,
  Flame,
  Utensils,
  Pill,
  ShoppingBasket,
  Milk,
  Boxes,
  LocateFixed,
  Radio,
  ExternalLink,
  MessageCircle,
  Send
} from 'lucide-react';
import { Business, ProductItem, DispatchedOrder, ZonaId, MetodoPago, UserSession, ZonaConfig, ServiceScheduleConfig, CalificacionPedido } from '../types/ibuy';
import { 
  COMERCIOS_COATEPEC, 
  ZONAS_COATEPEC, 
  PATROCINIOS_DESTACADOS, 
  COMUNIDADES_COATEPEC_COORDS,
  DEFAULT_ZONAS_CONFIG,
  calculateDistanceKm,
  getBusinessCoverImage
} from '../data/ibuyData';
import { isStoreOpen } from '../utils/nlpEngine';
import { LiveTrackingView } from './LiveTrackingView';
import { CustomerOrdersModal } from './CustomerOrdersModal';

interface ClientAppProps {
  simulatedTime: string;
  orders: DispatchedOrder[];
  businesses?: Business[];
  onPlaceOrder: (order: DispatchedOrder) => void;
  onAdvanceOrderStatus?: (orderId: string, status: any) => void;
  currentSession: UserSession;
  onChangeUserLocation?: (community: string, zone: ZonaId) => void;
  onOpenAuthModal?: () => void;
  onOpenWhatsAppAssistant?: () => void;
  zones?: ZonaConfig[];
  serviceSchedule?: ServiceScheduleConfig;
  onSubmitRating?: (orderId: string, rating: CalificacionPedido) => void;
}

interface CartItem {
  id: string;
  storeId: string;
  storeName: string;
  productName: string;
  price: number;
  quantity: number;
  notes?: string;
  requiereStock?: boolean;
}

export const ClientApp: React.FC<ClientAppProps> = ({
  simulatedTime,
  orders,
  businesses,
  onPlaceOrder,
  onAdvanceOrderStatus,
  currentSession,
  onChangeUserLocation,
  onOpenAuthModal,
  onOpenWhatsAppAssistant,
  zones,
  serviceSchedule,
  onSubmitRating
}) => {
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStoreModal, setActiveStoreModal] = useState<Business | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState<boolean>(false);

  // Sorting mode: 'orden_ibuy' (order set by admin in BusinessManager), 'cercania' (GPS), 'rating'
  const [sortBy, setSortBy] = useState<'orden_ibuy' | 'cercania' | 'rating'>('orden_ibuy');

  const [currentCommunity, setCurrentCommunity] = useState<string>(
    currentSession.comunidadUbicacion || 'Meyuca de Morelos'
  );

  const initialCoords = COMUNIDADES_COATEPEC_COORDS[currentCommunity] || COMUNIDADES_COATEPEC_COORDS['Meyuca de Morelos'];
  const [selectedZone, setSelectedZone] = useState<ZonaId>(
    currentSession.zonaUbicacion || (initialCoords ? initialCoords.zona : 'Zona 3')
  );

  // Effective dynamic zones
  const effectiveZones = (zones && zones.length > 0) ? zones : DEFAULT_ZONAS_CONFIG;

  // Sync with currentSession if changed from Navbar
  useEffect(() => {
    if (currentSession.comunidadUbicacion && currentSession.comunidadUbicacion !== currentCommunity) {
      setCurrentCommunity(currentSession.comunidadUbicacion);
      const coords = COMUNIDADES_COATEPEC_COORDS[currentSession.comunidadUbicacion];
      if (coords) {
        setSelectedZone(coords.zona);
        setDeliveryAddress(`${currentSession.comunidadUbicacion} (Centro)`);
      }
    }
  }, [currentSession.comunidadUbicacion]);

  // Checkout form fields
  const [clientName, setClientName] = useState<string>(currentSession.nombre || 'María Gómez');
  const [clientPhone, setClientPhone] = useState<string>(currentSession.identificador || '722 450 1122');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    `${currentCommunity} (Entrada principal)`
  );
  const [addressReference, setAddressReference] = useState<string>(
    'Casa azul de dos pisos junto a la tienda'
  );
  
  const [paymentMethod, setPaymentMethod] = useState<MetodoPago>('Efectivo');
  const [cashAmount, setCashAmount] = useState<number>(200);

  // Categories
  const requestedCategories = [
    { id: 'TODOS', label: 'Todos', icon: '🏪', categoryMatch: 'TODOS' },
    { id: 'comida', label: 'Comida', icon: '🍔', categoryMatch: 'Restaurante' },
    { id: 'farmacia', label: 'Farmacia', icon: '💊', categoryMatch: 'Farmacia' },
    { id: 'compras_mandado', label: 'Compras de Mandado', icon: '🛍️', categoryMatch: 'Mandado / Particular' },
    { id: 'abarrote', label: 'Abarrotes', icon: '🧀', categoryMatch: 'Abarrotes' }
  ];

  // Selection handlers via Dropdown Menu
  const handleCommunityChange = (communityName: string) => {
    setCurrentCommunity(communityName);
    // Find zone in dynamic zones
    const zoneFound = effectiveZones.find(z => z.comunidades.includes(communityName));
    const targetZone: ZonaId = (zoneFound ? zoneFound.id : (COMUNIDADES_COATEPEC_COORDS[communityName]?.zona || 'Zona 1')) as ZonaId;
    setSelectedZone(targetZone);
    setDeliveryAddress(`${communityName} (Centro)`);
    if (onChangeUserLocation) {
      onChangeUserLocation(communityName, targetZone);
    }
  };

  const currentZoneConfig = effectiveZones.find(z => z.id === selectedZone);
  const shippingFee = currentZoneConfig ? currentZoneConfig.tarifaEnvio : (ZONAS_COATEPEC[selectedZone]?.tarifaBase || 25);
  const currentZoneInfo = ZONAS_COATEPEC[selectedZone] || ZONAS_COATEPEC['Zona 1'];

  // Compute businesses with delivery details based on selected zone
  const storesProcessed = useMemo(() => {
    const sourceStores = (businesses && businesses.length > 0) ? businesses : COMERCIOS_COATEPEC;
    return sourceStores.map((store) => {
      const isLocal = store.zonaUbicacion === selectedZone;
      const dynamicEta = isLocal ? '15-25 min' : currentZoneInfo.tiempoEstimado;
      return {
        ...store,
        dynamicEta,
        isLocal
      };
    });
  }, [businesses, selectedZone, currentZoneInfo]);

  // Filter & Sort businesses
  const filteredAndSortedStores = useMemo(() => {
    let result = storesProcessed.filter((store) => {
      if (store.activo === false) return false;

      if (selectedCategory !== 'TODOS') {
        const catObj = requestedCategories.find(c => c.id === selectedCategory);
        if (catObj && catObj.categoryMatch && catObj.categoryMatch !== 'TODOS') {
          if (catObj.categoryMatch === 'Restaurante') {
            if (store.categoria !== 'Restaurante' && store.categoria !== 'Taquería') return false;
          } else if (store.categoria !== catObj.categoryMatch) {
            return false;
          }
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = store.nombre.toLowerCase().includes(q);
        const matchDesc = store.descripcionCorta?.toLowerCase().includes(q);
        const matchCat = store.categoria.toLowerCase().includes(q);
        const matchItems = store.popularItems.some(i => i.nombre.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchCat && !matchItems) return false;
      }
      return true;
    });

    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else {
      // 'orden_ibuy' or default: Honors order set by administrator in BusinessManager
      result.sort((a, b) => (a.ordenPrioridad ?? 999) - (b.ordenPrioridad ?? 999));
    }

    return result;
  }, [storesProcessed, selectedCategory, searchQuery, sortBy]);

  const addToCart = (store: Business, product: { nombre: string; precio: number }) => {
    setCart((prev) => {
      const existing = prev.find(item => item.productName === product.nombre && item.storeId === store.id);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random()}`,
          storeId: store.id,
          storeName: store.nombre,
          productName: product.nombre,
          price: product.precio,
          quantity: 1
        }
      ];
    });
    setCartDrawerOpen(true);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;

    const primaryStoreName = cart[0].storeName;
    const randomSponsor = PATROCINIOS_DESTACADOS[Math.floor(Math.random() * PATROCINIOS_DESTACADOS.length)];

    const newOrder: DispatchedOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Justo ahora',
      codigoEntregaCliente: String(Math.floor(1000 + Math.random() * 9000)),
      status: 'ASIGNADO',
      repartidorAsignado: 'Luis Alberto Mendoza',
      repartidorTelefono: '722-349-1102',
      repartidorVehiculo: 'Italika FT150 Roja',
      repartidorPlacas: 'M98-KLA',
      data: {
        accion_detectada: 'CREAR_PEDIDO',
        cliente: {
          nombre: clientName || 'Cliente IBUY',
          telefono: clientPhone,
          direccion_entrega: `${deliveryAddress} (${addressReference})`,
          zona: selectedZone
        },
        pedido: {
          establecimiento: primaryStoreName,
          items: cart.map(item => ({
            producto: item.productName,
            cantidad: item.quantity,
            notas: item.notes || null
          })),
          subtotal_estimado: subtotal,
          costo_envio: shippingFee,
          total_estimado: total,
          metodo_pago: paymentMethod,
          cambio_para: paymentMethod === 'Efectivo' ? cashAmount : 0
        },
        logistica: {
          requiere_confirmacion_stock: false,
          tiempo_estimado_entrega_minutos: ZONAS_COATEPEC[selectedZone].tiempoEstimado,
          mensaje_estado: `¡Pedido confirmado! Repartidor asignado en camino a ${primaryStoreName} para entrega en ${deliveryAddress} (${selectedZone}).`
        },
        promocion_patrocinada: {
          mostrar: true,
          negocio: randomSponsor.negocio,
          mensaje: randomSponsor.mensaje
        },
        datos_reclutamiento: {
          es_solicitud: false,
          nombre_candidato: null,
          telefono: null,
          vehiculo: null
        }
      }
    };

    onPlaceOrder(newOrder);
    setCart([]);
    setCartDrawerOpen(false);
    setActiveTrackingOrderId(newOrder.id);
  };

  // If currently tracking an order, show the LiveTrackingView
  const currentTrackingOrder = orders.find(o => o.id === activeTrackingOrderId);
  if (currentTrackingOrder) {
    return (
      <LiveTrackingView
        order={currentTrackingOrder}
        onBack={() => setActiveTrackingOrderId(null)}
        onAdvanceStatus={onAdvanceOrderStatus}
        userCoords={{ lat: 18.925, lng: -99.768, addressName: currentCommunity }}
        onSubmitRating={onSubmitRating}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Schedule Banner if Closed */}
      {serviceSchedule && !serviceSchedule.servicioActivo && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block font-black">Servicio IBUY Actualmente Pausado o Fuera de Horario</strong>
              <span>
                {serviceSchedule.mensajeFueraDeHorario || `Horario de atención: ${serviceSchedule.horarioApertura} a ${serviceSchedule.horarioCierre} hrs.`}
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            {serviceSchedule.horarioApertura} - {serviceSchedule.horarioCierre}
          </span>
        </div>
      )}

      {/* 1. ULTRA-POLISHED HERO & RAPPI / DIDI STYLE HEADER */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/50 backdrop-blur border border-white/20 shadow">
                ⚡ Rappi & DiDi Coatepec de Harinas
              </span>
              <span className="text-xs text-orange-100 font-semibold">
                Barbacoa • Farmacia • Abarrotes • Mandados
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Pide lo que quieras, <br className="hidden sm:inline" />
              <span className="text-amber-200">te lo llevamos volando en moto.</span>
            </h1>

            <p className="text-xs sm:text-sm text-orange-100/90 max-w-lg leading-relaxed">
              Ordena desde la página o pide directo por WhatsApp. Sigue en vivo el recorrido de tu repartidor desde la tienda hasta tu puerta.
            </p>
          </div>

          {/* Action buttons: Active Order & My Orders */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {orders.length > 0 && (
              <button
                onClick={() => setActiveTrackingOrderId(orders[0].id)}
                className="bg-slate-950/80 hover:bg-slate-950 backdrop-blur border border-orange-400/40 rounded-3xl p-4 flex items-center gap-3.5 text-left transition shadow-2xl shrink-0 cursor-pointer transform hover:scale-105"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
                  <Bike className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] text-orange-400 uppercase font-black tracking-wider block">
                    Seguimiento en Vivo
                  </span>
                  <span className="text-sm font-extrabold text-white block">
                    Orden #{orders[0].id}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>Ver mapa de ruta</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={() => setIsCustomerOrdersOpen(true)}
              className="bg-slate-950/80 hover:bg-slate-950 backdrop-blur border border-white/20 hover:border-orange-400 rounded-3xl p-4 flex items-center gap-3.5 text-left transition shadow-2xl shrink-0 cursor-pointer transform hover:scale-105"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-orange-300 uppercase font-black tracking-wider block">
                  Perfil de Cliente
                </span>
                <span className="text-sm font-extrabold text-white block">
                  Mis Pedidos & Compras
                </span>
                <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                  <span>Ver compras y calificar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* FILTRO DE ZONA Y COSTO DE ENVÍO */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/70 border border-white/20 flex items-center justify-center text-orange-400 shrink-0 shadow">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-orange-200 uppercase font-black tracking-wider block">
                Filtro de Zona:
              </span>
              <strong className="text-white text-sm flex items-center gap-1.5">
                <span>📍 {currentCommunity}</span>
                <span className="text-orange-300 font-bold">({selectedZone})</span>
              </strong>
            </div>
          </div>

          {/* Menú Desplegable de Zonas & Comunidades + Costo de Envío */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <select
                value={currentCommunity}
                onChange={(e) => handleCommunityChange(e.target.value)}
                className="w-full bg-slate-950 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-2xl border-2 border-orange-400/90 shadow-xl focus:outline-none focus:border-orange-300 cursor-pointer appearance-none pr-8"
              >
                {effectiveZones.map((z) => (
                  <optgroup key={z.id} label={`${z.id}: ${z.nombre} • Tarifa: $${z.tarifaEnvio} MXN`}>
                    {z.comunidades.map((comm) => (
                      <option key={comm} value={comm}>
                        📍 {comm} ({z.id})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-orange-400 absolute right-3 top-3 pointer-events-none rotate-90" />
            </div>

            <div className="bg-slate-950 px-4 py-2 rounded-2xl border-2 border-emerald-500/60 text-center shrink-0 shadow-lg">
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Costo Envío:</span>
              <span className="text-emerald-400 font-mono font-black text-sm">
                ${shippingFee} MXN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DUAL ORDERING CHANNELS BANNER (Pide en Web o pide por WhatsApp) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Web channel */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold shrink-0 text-xl">
            💻
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm">Pide desde la Página Web</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Arma tu canasta, elige método de pago y sigue el mapa interactivo del recorrido de tu repartidor.
            </p>
          </div>
        </div>

        {/* WhatsApp Channel */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-emerald-800/60 flex items-center justify-between gap-3.5 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0 text-xl">
              💬
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-white text-sm">O Pide Directo por WhatsApp</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded font-mono font-bold">IA Activa</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Envía mensaje de voz o texto; el motor crea la orden y te manda el link de rastreo web.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenWhatsAppAssistant}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abrir Chat</span>
          </button>
        </div>
      </div>

      {/* 3. BUSCADOR & CATEGORIAS EXACTAS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Buscar comida, tacos, barbacoa, farmacia, paracetamol, queso, abarrotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-white placeholder-slate-400 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-800 shadow-inner"
          />
        </div>

        {/* Categorías abajo del buscador: comida, farmacia, compras de mandado, abarrotes */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>Categorías:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {requestedCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-500/20 font-black'
                      : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-bold leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. ANUNCIOS Y PROMOCIONES DE COMIDA DEL DÍA */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Promociones Patrocinadas & Ofertas de Comida del Día</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Exclusivas en IBUY Coatepec</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {PATROCINIOS_DESTACADOS.slice(0, 3).map((ad, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/30 rounded-3xl p-4 shadow-lg hover:border-orange-500 transition relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -z-10" />

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ad.imagen}</span>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {ad.descuento}
                    </span>
                    <h4 className="font-extrabold text-white text-sm leading-tight mt-0.5">{ad.negocio}</h4>
                  </div>
                </div>

                <span className="text-[10px] text-emerald-400 font-mono font-bold">Activo</span>
              </div>

              <p className="text-xs text-slate-300 leading-snug font-medium mb-3">
                "{ad.mensaje}"
              </p>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 text-[10px]">{ad.valido}</span>
                <button
                  onClick={() => {
                    const matchedStore = COMERCIOS_COATEPEC.find(s => s.nombre.toLowerCase().includes(ad.negocio.toLowerCase().split(' ')[0]));
                    if (matchedStore) setActiveStoreModal(matchedStore);
                  }}
                  className="text-orange-400 hover:text-white font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Pedir ahora</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. NEGOCIOS DISPONIBLES PARA ENTREGA EN LA ZONA SELECCIONADA */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-400" />
              <span>Negocios con Entrega en {currentCommunity}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {selectedZone} • Tarifa de envío calculada: <strong className="text-emerald-400 font-mono font-bold">${shippingFee} MXN</strong> (Tiempo estimado: {currentZoneInfo.tiempoEstimado}).
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setSortBy('orden_ibuy')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                sortBy === 'orden_ibuy' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 Destacados (Admin)
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                sortBy === 'rating' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⭐ Mejor Calificados
            </button>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedStores.map((store) => {
            const isOpen = isStoreOpen(store.horarioApertura, store.horarioCierre, store.es24Horas, simulatedTime);
            const coverImage = getBusinessCoverImage(store);

            return (
              <div
                key={store.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-lg group"
              >
                <div>
                  {/* Store Header Banner with Real Dish / Supermarket / Pharmacy Photography */}
                  <div className="h-44 relative overflow-hidden bg-slate-950">
                    <img
                      src={coverImage}
                      alt={store.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Top floating tags: Category tag & Open/Closed badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-orange-400 border border-orange-500/30 shadow-md">
                        {store.categoria === 'Restaurante' || store.categoria === 'Taquería'
                          ? '🍛 Platillo de Comida'
                          : store.categoria === 'Abarrotes'
                          ? '🛒 Supermercado & Abarrotes'
                          : store.categoria === 'Farmacia'
                          ? '💊 Farmacia & Salud'
                          : store.categoria}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isOpen ? (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 shadow-md">
                            Abierto
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white shadow-md">
                            Cerrado ({store.horarioApertura}h)
                          </span>
                        )}

                        <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-800 shadow-md">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {store.rating || 4.8}
                        </span>
                      </div>
                    </div>

                    {/* Bottom floating title and ETA on the photo */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-black text-white text-base leading-tight group-hover:text-orange-400 transition drop-shadow-md">
                        {store.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
                          🛵 Envío: ${shippingFee} MXN
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-sm">
                          ⏱️ {store.dynamicEta}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Store Details */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {store.descripcionCorta || 'Comercio afiliado a la red de mandados IBUY.'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Llega en {store.dynamicEta}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                        <Bike className="w-3.5 h-3.5" />
                        Envío ${shippingFee} MXN
                      </span>
                    </div>

                    {/* Popular Menu Items */}
                    {store.menu && store.menu.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Platillos / Productos destacados:</div>
                        {store.menu.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                          >
                            <div className="truncate mr-2">
                              <div className="font-semibold text-slate-200 truncate">{item.nombre}</div>
                              <div className="text-[10px] text-emerald-400 font-mono font-bold">${item.precio} MXN</div>
                            </div>
                            <button
                              onClick={() => addToCart(store, item)}
                              className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-slate-950 transition cursor-pointer shrink-0"
                              title="Agregar a mi canasta"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => setActiveStoreModal(store)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5 text-orange-400" />
                    <span>Ver Menú Completo ({store.menu?.length || store.popularItems.length} opciones)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && !cartDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-2xl shadow-orange-500/40 flex items-center gap-3 transition transform hover:scale-105 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-slate-950 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-extrabold">Ver Mi Canasta</div>
              <div className="text-[10px] opacity-90">${total} MXN con envío</div>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Store Menu Modal */}
      {activeStoreModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header Photo Banner of Dish / Supermarket / Pharmacy */}
            <div className="relative h-44 w-full bg-slate-950 overflow-hidden shrink-0">
              <img
                src={getBusinessCoverImage(activeStoreModal)}
                alt={activeStoreModal.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              
              <button
                onClick={() => setActiveStoreModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950/80 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold backdrop-blur-md border border-slate-700 cursor-pointer"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-5 right-5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 backdrop-blur-sm">
                  {activeStoreModal.categoria}
                </span>
                <h3 className="font-black text-white text-xl leading-tight mt-1">{activeStoreModal.nombre}</h3>
                <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{activeStoreModal.direccion}</span>
                </div>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productos Disponibles:</h4>

              {(activeStoreModal.menu || activeStoreModal.popularItems.map((p, i) => ({
                id: `pop-${i}`,
                nombre: p.nombre,
                descripcion: 'Especialidad de la casa preparada al momento.',
                precio: p.precioEstimado,
                categoria: 'General',
                disponible: true
              }))).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center gap-4 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="font-bold text-white text-sm">{item.nombre}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.descripcion}</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
                      ${item.precio} MXN
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(activeStoreModal, item);
                    }}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart & Checkout Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white text-base">Mi Canasta IBUY</h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="font-bold text-slate-400">Tu canasta está vacía</p>
                  <p className="text-[11px]">Selecciona platillos o productos de las tiendas afiliadas.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Productos Seleccionados:
                    </div>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center gap-2"
                      >
                        <div className="flex-1 truncate">
                          <div className="font-bold text-slate-200 truncate">{item.productName}</div>
                          <div className="text-[10px] text-slate-500">{item.storeName}</div>
                          <div className="font-mono text-emerald-400 font-bold text-xs mt-0.5">
                            ${item.price * item.quantity} MXN
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold font-mono text-white text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span>Destino de Entrega ({selectedZone}):</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">${shippingFee} MXN</span>
                    </div>

                    {/* Zone & Community Dropdown in Checkout */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Selecciona Zona y Comunidad de Entrega (Menú Desplegable):
                      </label>
                      <select
                        value={currentCommunity}
                        onChange={(e) => handleCommunityChange(e.target.value)}
                        className="w-full bg-slate-900 border-2 border-orange-500/50 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        {(Object.keys(ZONAS_COATEPEC) as ZonaId[]).map((zId) => {
                          const z = ZONAS_COATEPEC[zId];
                          return (
                            <optgroup key={zId} label={`${z.id}: ${z.nombre} (Envío: ${z.rangoTarifa})`}>
                              {z.comunidades.map((comm) => (
                                <option key={comm} value={comm}>
                                  📍 {comm} • {z.id} (${z.tarifaBase} MXN)
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>Costo de envío calculado:</span>
                        <strong className="text-emerald-400 font-mono font-bold">${shippingFee} MXN</strong>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                        Calle, Número o Punto de Entrega:
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Ej. Meyuca de Morelos, frente a la primaria"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                        Referencia para el Repartidor:
                      </label>
                      <input
                        type="text"
                        value={addressReference}
                        onChange={(e) => setAddressReference(e.target.value)}
                        placeholder="Ej. Casa verde con reja blanca, timbre negro"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Método de Pago:</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Efectivo')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                          paymentMethod === 'Efectivo'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span className="text-[10px]">Efectivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Transferencia')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                          paymentMethod === 'Transferencia'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span className="text-[10px]">SPEI / Transf.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Tarjeta')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                          paymentMethod === 'Tarjeta'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[10px]">Terminal Moto</span>
                      </button>
                    </div>

                    {paymentMethod === 'Efectivo' && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-semibold block">
                          ¿Con cuánto billete vas a pagar? (Llevamos tu cambio exacto):
                        </label>
                        <div className="flex gap-1.5">
                          {[100, 200, 500, 1000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setCashAmount(amt)}
                              className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition ${
                                cashAmount === amt
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                              }`}
                            >
                              ${amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal productos:</span>
                      <span className="font-mono text-slate-200">${subtotal} MXN</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Envío ({selectedZone}):</span>
                      <span className="font-mono text-emerald-400">${shippingFee} MXN</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                      <span>Total a Pagar:</span>
                      <span className="font-mono text-emerald-400">${total} MXN</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950">
              <button
                onClick={handleConfirmOrder}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 transition cursor-pointer"
              >
                <PackageCheck className="w-5 h-5" />
                <span>Confirmar Pedido (${total} MXN)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Orders & Purchase History Modal */}
      <CustomerOrdersModal
        isOpen={isCustomerOrdersOpen}
        onClose={() => setIsCustomerOrdersOpen(false)}
        orders={orders}
        currentSession={currentSession}
        onOpenTracking={(orderId) => {
          setActiveTrackingOrderId(orderId);
          setIsCustomerOrdersOpen(false);
        }}
        onSubmitRating={onSubmitRating || (() => {})}
      />
    </div>
  );
};
