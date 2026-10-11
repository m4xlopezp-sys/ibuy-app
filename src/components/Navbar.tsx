import React, { useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Clock, 
  Bike, 
  ShieldCheck, 
  User, 
  LogOut, 
  ChevronDown, 
  Layers, 
  Store, 
  MessageSquareCode, 
  Compass, 
  LogIn,
  ShoppingBag,
  ExternalLink,
  Eye,
  SlidersHorizontal,
  DollarSign,
  X,
  Check,
  MessageSquare,
  Settings
} from 'lucide-react';
import { UserSession, ZonaId, ServiceScheduleConfig, ZonaConfig } from '../types/ibuy';
import { ZONAS_COATEPEC, COMUNIDADES_COATEPEC_COORDS, DEFAULT_ZONAS_CONFIG } from '../data/ibuyData';

export type RoleView = 'client' | 'admin' | 'business_manager' | 'driver' | 'assistant' | 'zones' | 'admin_zones' | 'couriers_manager';

interface NavbarProps {
  activeRole: RoleView;
  setActiveRole: (role: RoleView) => void;
  simulatedTime: string;
  setSimulatedTime: (time: string) => void;
  ordersCount: number;
  candidatesCount: number;
  isAiConnected: boolean;
  currentSession: UserSession;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onChangeUserLocation?: (community: string, zone: ZonaId) => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenWhatsAppCenter?: () => void;
  unreadWhatsAppCount?: number;
  serviceSchedule?: ServiceScheduleConfig;
  zones?: ZonaConfig[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  simulatedTime,
  setSimulatedTime,
  ordersCount,
  candidatesCount,
  isAiConnected,
  currentSession,
  onOpenAuthModal,
  onLogout,
  onChangeUserLocation,
  cartCount = 0,
  onOpenCart,
  onOpenWhatsAppCenter,
  unreadWhatsAppCount = 0,
  serviceSchedule,
  zones
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  
  const isAdmin = currentSession.role === 'administrador';
  const isDriver = currentSession.role === 'repartidor';
  const isClient = currentSession.role === 'cliente';

  const effectiveZones = (zones && zones.length > 0) ? zones : DEFAULT_ZONAS_CONFIG;

  const currentCommunity = currentSession.comunidadUbicacion || 'Meyuca de Morelos';
  const currentZone: ZonaId = currentSession.zonaUbicacion || 
    (COMUNIDADES_COATEPEC_COORDS[currentCommunity]?.zona || 'Zona 3');
  const currentZoneConfig = effectiveZones.find(z => z.id === currentZone);
  const currentZoneDetail = ZONAS_COATEPEC[currentZone];
  const dynamicTarifaText = currentZoneConfig ? `$${currentZoneConfig.tarifaEnvio} MXN` : (currentZoneDetail ? currentZoneDetail.rangoTarifa : '$60 MXN');

  const handleSelectCommunity = (community: string) => {
    const zoneFound = effectiveZones.find(z => z.comunidades.includes(community));
    const targetZone: ZonaId = (zoneFound ? zoneFound.id : (COMUNIDADES_COATEPEC_COORDS[community]?.zona || 'Zona 1')) as ZonaId;
    if (onChangeUserLocation) {
      onChangeUserLocation(community, targetZone);
    }
    setZoneDropdownOpen(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/98 backdrop-blur sticky top-0 z-50 shadow-xl">
      {/* 1. TOP SUBTLE UTILITY BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px]">
            <Radio className="w-3 h-3 animate-pulse text-orange-400" />
            <span>IBUY Coatepec de Harinas</span>
          </span>

          {/* Service Open/Closed Live Status Badge */}
          {serviceSchedule && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[10px] border ${
              serviceSchedule.servicioActivo
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${serviceSchedule.servicioActivo ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{serviceSchedule.servicioActivo ? `Abierto (${serviceSchedule.horarioApertura} - ${serviceSchedule.horarioCierre})` : 'Pausado'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* WhatsApp Live Notifications Button */}
          {onOpenWhatsAppCenter && (
            <button
              onClick={onOpenWhatsAppCenter}
              className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition cursor-pointer"
              title="Notificaciones automáticas de WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp</span>
              {unreadWhatsAppCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 animate-pulse">
                  {unreadWhatsAppCount}
                </span>
              )}
            </button>
          )}

          {/* Subtle Simulated Clock */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px]">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400 hidden sm:inline">Hora:</span>
            <input
              type="time"
              value={simulatedTime}
              onChange={(e) => setSimulatedTime(e.target.value)}
              className="bg-transparent text-amber-300 font-mono font-bold text-[11px] focus:outline-none cursor-pointer"
              title="Cambia la hora para simular horarios de comercios"
            />
          </div>

          {/* User Session / Login Button */}
          <div className="relative">
            {currentSession && currentSession.nombre ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isAdmin
                      ? 'bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20'
                      : isDriver
                      ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                      : 'bg-slate-950 text-slate-200 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  ) : isDriver ? (
                    <Bike className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="max-w-[120px] truncate">
                    {currentSession.nombre.split(' ')[0]} ({isAdmin ? 'Admin' : isDriver ? 'Repartidor' : 'Cliente'})
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Profile dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 text-xs space-y-2">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="font-extrabold text-white">{currentSession.nombre}</div>
                      <div className="text-[11px] text-slate-400">{currentSession.identificador}</div>
                      <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        Rol: {currentSession.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 block">
                          Herramientas Admin:
                        </span>
                        <button
                          onClick={() => {
                            setActiveRole('business_manager');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Store className="w-3.5 h-3.5 text-orange-400" />
                          <span>Gestión y Orden de Negocios</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveRole('admin_zones');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-orange-400" />
                          <span>Gestión y Orden de Zonas</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveRole('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-orange-400" />
                          <span>Torre de Control</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveRole('couriers_manager');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Bike className="w-3.5 h-3.5 text-purple-400" />
                          <span>Gestión y Orden de Repartidores</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveRole('assistant');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <MessageSquareCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Modo IA JSON</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveRole('client');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Ver App como Cliente</span>
                        </button>
                      </div>
                    )}

                    <div className="pt-1 border-t border-slate-800 flex gap-1">
                      <button
                        onClick={() => {
                          onOpenAuthModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center font-bold text-[11px] cursor-pointer"
                      >
                        Cambiar Usuario
                      </button>
                      <button
                        onClick={() => {
                          onLogout();
                          setProfileDropdownOpen(false);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                        title="Cerrar Sesión"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR - CLEAN & ATTRACTIVE LIKE RAPPI / DIDI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand identity (Rappi/DiDi aesthetic with vibrant orange) */}
        <div 
          onClick={() => setActiveRole('client')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-xl text-white tracking-tighter">
              <span className="text-orange-400">I</span>BUY
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">IBUY</span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Coatepec
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isAdmin ? 'Panel Maestro de Administración' : isDriver ? 'Panel de Repartidor en Turno' : 'Mandados, Comida & Entregas Regionales'}
            </p>
          </div>
        </div>

        {/* Center / Right Section */}
        <div className="flex items-center gap-3">
          {/* INTERACTIVE ZONE DROPDOWN MENU (User requested: la ubicacion no sera por gps si no por una cantidad de zonas en un tipo de menu desplegable para tambien asi calcular el costo del envio) */}
          <div className="relative">
            <button
              onClick={() => setZoneDropdownOpen(!zoneDropdownOpen)}
              className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-800 hover:border-orange-500/50 text-xs text-slate-300 transition cursor-pointer shadow-md group"
            >
              <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 group-hover:scale-110 transition" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-tight">Filtro de Zona:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-white font-extrabold truncate max-w-[120px] sm:max-w-[170px]">
                    {currentCommunity}
                  </strong>
                  <span className="text-[10px] font-black font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Envío: {currentZoneDetail ? currentZoneDetail.rangoTarifa : '$60 MXN'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition" />
                </div>
              </div>
            </button>

            {/* Dropdown Menu Modal / Popover */}
            {zoneDropdownOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 z-50 text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span className="font-extrabold text-white text-sm">Selecciona tu Zona de Entrega</span>
                  </div>
                  <button
                    onClick={() => setZoneDropdownOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  Elige tu comunidad para calcular automáticamente el costo de envío y tiempo de entrega.
                </p>

                {/* Zones list with communities */}
                <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                  {(Object.keys(ZONAS_COATEPEC) as ZonaId[]).map((zoneId) => {
                    const z = ZONAS_COATEPEC[zoneId];
                    const isSelectedZone = currentZone === zoneId;

                    return (
                      <div key={zoneId} className={`p-2.5 rounded-2xl border transition ${
                        isSelectedZone ? 'bg-orange-500/10 border-orange-500/40' : 'bg-slate-950 border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-white text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                            {z.id}: {z.nombre}
                          </span>
                          <span className="text-emerald-400 font-mono font-black text-xs bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            {z.rangoTarifa}
                          </span>
                        </div>

                        {/* Communities buttons inside this zone */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {z.comunidades.map((comm) => {
                            const isCurrentComm = currentCommunity === comm;
                            return (
                              <button
                                key={comm}
                                onClick={() => handleSelectCommunity(comm)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                  isCurrentComm
                                    ? 'bg-orange-500 text-slate-950 shadow'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                }`}
                              >
                                {isCurrentComm && <Check className="w-3 h-3" />}
                                <span>{comm}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cart button for ordering */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition cursor-pointer font-bold text-xs shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Mi Pedido</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* If user is not logged in: prominent Iniciar Sesión button in the main bar */}
          {!currentSession.nombre ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* 3. DEDICATED ADMIN BAR - ONLY VISIBLE WHEN AN ADMINISTRATOR IS LOGGED IN */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-orange-500/30 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 font-black text-[11px] border border-orange-500/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel Administrador</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden md:inline">
                Control maestro de IBUY Coatepec
              </span>
            </div>

            {/* Admin navigation tabs: Las 5 secciones solicitadas por el usuario */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {/* 1. Gestion y orden de negocios */}
              <button
                onClick={() => setActiveRole('business_manager')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-xs ${
                  activeRole === 'business_manager'
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                    : 'text-slate-300 hover:text-white bg-slate-950/80 border border-slate-800'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Gestión y Orden de Negocios</span>
              </button>

              {/* 2. Gestion y oden de zonas */}
              <button
                onClick={() => setActiveRole('admin_zones')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-xs ${
                  activeRole === 'admin_zones'
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                    : 'text-slate-300 hover:text-white bg-slate-950/80 border border-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Gestión y Orden de Zonas</span>
              </button>

              {/* 3. Torre de Control */}
              <button
                onClick={() => setActiveRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-xs ${
                  activeRole === 'admin'
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                    : 'text-slate-300 hover:text-white bg-slate-950/80 border border-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Torre de Control</span>
                {ordersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-950 text-orange-400">
                    {ordersCount}
                  </span>
                )}
              </button>

              {/* 4. Gestion y Orden de repartidores */}
              <button
                onClick={() => setActiveRole('couriers_manager')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-xs ${
                  activeRole === 'couriers_manager'
                    ? 'bg-purple-500 text-white font-black shadow-md shadow-purple-500/20'
                    : 'text-slate-300 hover:text-white bg-slate-950/80 border border-slate-800'
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-purple-400" />
                <span>Gestión y Orden de Repartidores</span>
              </button>

              {/* 5. Modo IA JSON */}
              <button
                onClick={() => setActiveRole('assistant')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-xs ${
                  activeRole === 'assistant'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white bg-slate-950/80 border border-slate-800'
                }`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Modo IA JSON</span>
              </button>

              {/* Alternar a vista de cliente */}
              <button
                onClick={() => setActiveRole('client')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-xs ${
                  activeRole === 'client'
                    ? 'bg-blue-500 text-white font-black shadow-md'
                    : 'text-blue-400 hover:text-white bg-blue-500/10 border border-blue-500/30'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Tienda (Cliente)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DRIVER QUICK BAR - ONLY VISIBLE WHEN A DRIVER IS LOGGED IN */}
      {isDriver && (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-950 to-purple-950/80 border-t border-purple-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-black text-[11px] border border-purple-500/40">
                <Bike className="w-3.5 h-3.5" />
                <span>Turno de Repartidor Activo</span>
              </span>
              <span className="text-slate-300 text-[11px]">
                {currentSession.nombre} • Solo verás tus pedidos asignados
              </span>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-1 rounded-xl bg-purple-950 border border-purple-700 hover:bg-purple-900 text-purple-200 font-bold text-xs transition cursor-pointer"
            >
              Cerrar Turno / Salir
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
