import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Bike, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  MapPin, 
  Sparkles,
  UserPlus,
  LogIn,
  Users
} from 'lucide-react';
import { UserSession, UserRole, ZonaId, UserProfile, Courier } from '../types/ibuy';
import { REPARTIDORES_INICIALES, COMUNIDADES_COATEPEC_COORDS } from '../data/ibuyData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (session: UserSession) => void;
  currentSession: UserSession;
  registeredUsers?: UserProfile[];
  onRegisterUser?: (newUser: UserProfile) => void;
  couriers?: Courier[];
  onRegisterDriver?: (newCourier: Courier) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentSession,
  registeredUsers = [],
  onRegisterUser,
  couriers = REPARTIDORES_INICIALES,
  onRegisterDriver
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>('cliente');

  // Client mode: 'login' | 'register'
  const [clientMode, setClientMode] = useState<'login' | 'register'>('login');
  const [selectedExistingUserId, setSelectedExistingUserId] = useState<string>(
    registeredUsers[0]?.id || ''
  );

  // Client form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCommunity, setClientCommunity] = useState('Meyuca de Morelos');
  const [clientPin, setClientPin] = useState('1234');
  const [clientError, setClientError] = useState('');

  // Admin form
  const [adminName, setAdminName] = useState('Carlos Admin');
  const [adminUser, setAdminUser] = useState('admin@ibuy.com');
  const [adminPin, setAdminPin] = useState('1234');
  const [adminError, setAdminError] = useState('');

  // Driver form
  const [driverMode, setDriverMode] = useState<'existente' | 'nuevo'>('existente');
  const [selectedDriverId, setSelectedDriverId] = useState(couriers[0]?.id || '');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState<'Moto' | 'Auto' | 'Bici'>('Moto');
  const [newDriverVehicleModel, setNewDriverVehicleModel] = useState('Italika FT150');
  const [newDriverPlacas, setNewDriverPlacas] = useState('');
  const [driverPin, setDriverPin] = useState('1234');
  const [driverError, setDriverError] = useState('');

  if (!isOpen) return null;

  // Handle Client Submit
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (clientMode === 'login') {
      // Login with selected or typed
      const found = registeredUsers.find(u => u.id === selectedExistingUserId);
      if (found) {
        onLogin({
          role: 'cliente',
          nombre: found.nombre,
          identificador: found.telefono,
          comunidadUbicacion: found.comunidadUbicacion,
          zonaUbicacion: found.zonaUbicacion
        });
        onClose();
        return;
      }
      
      // Fallback
      const zone = COMUNIDADES_COATEPEC_COORDS[clientCommunity]?.zona || 'Zona 1';
      onLogin({
        role: 'cliente',
        nombre: clientName.trim() || 'María Gómez',
        identificador: clientPhone.trim() || '722 450 1122',
        comunidadUbicacion: clientCommunity,
        zonaUbicacion: zone
      });
      onClose();
    } else {
      // Register new user
      if (!clientName.trim() || !clientPhone.trim()) {
        setClientError('Por favor ingresa tu nombre y teléfono móvil');
        return;
      }

      const zone = COMUNIDADES_COATEPEC_COORDS[clientCommunity]?.zona || 'Zona 3';
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        role: 'cliente',
        nombre: clientName.trim(),
        telefono: clientPhone.trim(),
        pin: clientPin || '1234',
        comunidadUbicacion: clientCommunity,
        zonaUbicacion: zone,
        fechaRegistro: new Date().toISOString().split('T')[0]
      };

      if (onRegisterUser) {
        onRegisterUser(newUser);
      }

      // Automatically login
      onLogin({
        role: 'cliente',
        nombre: newUser.nombre,
        identificador: newUser.telefono,
        comunidadUbicacion: newUser.comunidadUbicacion,
        zonaUbicacion: newUser.zonaUbicacion
      });
      onClose();
    }
  };

  // Handle Admin Submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin === 'admin') {
      onLogin({
        role: 'administrador',
        nombre: adminName || 'Administrador IBUY',
        identificador: adminUser
      });
      onClose();
    } else {
      setAdminError('PIN incorrecto. Usa el PIN demo: 1234');
    }
  };

  // Handle Driver Submit
  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDriverError('');

    if (driverMode === 'existente') {
      const courier = couriers.find(c => c.id === selectedDriverId);
      if (!courier) return;

      if (driverPin === '1234' || driverPin === courier.pinAcceso) {
        onLogin({
          role: 'repartidor',
          nombre: courier.nombre,
          identificador: courier.telefono,
          courierId: courier.id
        });
        onClose();
      } else {
        setDriverError('PIN incorrecto. Usa el PIN de conductor: 1234');
      }
    } else {
      if (!newDriverName.trim()) {
        setDriverError('Ingresa el nombre completo del repartidor');
        return;
      }

      const newCourier: Courier = {
        id: `rep-${Date.now()}`,
        nombre: newDriverName.trim(),
        telefono: newDriverPhone.trim() || '722-000-0000',
        vehiculo: newDriverVehicle,
        modeloVehiculo: newDriverVehicleModel,
        placas: newDriverPlacas || 'S/P',
        estado: 'DISPONIBLE',
        pedidosCompletados: 0,
        calificacion: 5.0,
        zonaPreferente: 'Zona 1',
        lat: 18.9250,
        lng: -99.7680,
        ubicacionActual: 'Base de Repartidores Coatepec',
        pinAcceso: driverPin || '1234'
      };

      if (onRegisterDriver) {
        onRegisterDriver(newCourier);
      }

      onLogin({
        role: 'repartidor',
        nombre: newCourier.nombre,
        identificador: newCourier.telefono,
        courierId: newCourier.id
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 text-xs max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 p-5 text-white flex justify-between items-start shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/30 px-2 py-0.5 rounded-full border border-white/20">
              Control de Acceso & Perfiles
            </span>
            <h3 className="text-xl font-black mt-1">Iniciar Sesión / Registro</h3>
            <p className="text-xs text-orange-100/90 mt-0.5">
              Accede a tus pedidos en proceso y compras guardadas
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-950/40 hover:bg-slate-950 text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('cliente')}
            className={`flex-1 py-2 rounded-xl font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cliente'
                ? 'bg-orange-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('administrador')}
            className={`flex-1 py-2 rounded-xl font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'administrador'
                ? 'bg-orange-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('repartidor')}
            className={`flex-1 py-2 rounded-xl font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'repartidor'
                ? 'bg-orange-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Repartidor</span>
          </button>
        </div>

        {/* Tab Forms Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. CLIENT TAB */}
          {activeTab === 'cliente' && (
            <div className="space-y-4">
              {/* Mode Toggle: Iniciar Sesión vs Registro */}
              <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setClientMode('login')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    clientMode === 'login'
                      ? 'bg-orange-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Usuarios Registrados</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('register')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    clientMode === 'register'
                      ? 'bg-orange-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Nueva Cuenta</span>
                </button>
              </div>

              {clientMode === 'login' ? (
                <form onSubmit={handleClientSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Selecciona un Usuario Registrado:
                    </label>
                    <div className="space-y-2">
                      {registeredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => setSelectedExistingUserId(user.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            selectedExistingUserId === user.id
                              ? 'bg-orange-500/10 border-orange-500 text-white'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs">{user.nombre}</div>
                            <div className="text-[11px] text-slate-400">
                              📞 {user.telefono} • 📍 {user.comunidadUbicacion}
                            </div>
                          </div>
                          {selectedExistingUserId === user.id && (
                            <CheckCircle2 className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    Ingresar con esta Cuenta
                  </button>
                </form>
              ) : (
                <form onSubmit={handleClientSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Nombre Completo:
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej. María Gómez"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Teléfono Móvil (WhatsApp):
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ej. 722 450 1122"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Tu Comunidad / Ubicación Principal:
                    </label>
                    <select
                      value={clientCommunity}
                      onChange={(e) => setClientCommunity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold text-xs focus:outline-none focus:border-orange-500"
                    >
                      {Object.keys(COMUNIDADES_COATEPEC_COORDS).map((c) => (
                        <option key={c} value={c}>
                          {c} ({COMUNIDADES_COATEPEC_COORDS[c].zona})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      PIN o Contraseña (4 dígitos):
                    </label>
                    <input
                      type="password"
                      value={clientPin}
                      onChange={(e) => setClientPin(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs font-mono"
                    />
                  </div>

                  {clientError && (
                    <div className="text-rose-400 text-[11px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{clientError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    Registrarme y Entrar
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 2. ADMIN TAB */}
          {activeTab === 'administrador' && (
            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] flex gap-2">
                <Lock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Control Maestro:</strong> Configura horarios del servicio, agrega zonas y tarifas, crea repartidores y despacha pedidos en la Torre de Control.
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Usuario o Correo:
                </label>
                <input
                  type="text"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  PIN de Acceso Seguro (Demo: 1234):
                </label>
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setAdminError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs font-mono"
                />
              </div>

              {adminError && (
                <div className="text-rose-400 text-[11px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Ingresar como Administrador
              </button>
            </form>
          )}

          {/* 3. DRIVER TAB */}
          {activeTab === 'repartidor' && (
            <form onSubmit={handleDriverSubmit} className="space-y-3">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] flex gap-2">
                <Bike className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Vista de Repartidor:</strong> Consulta tus pedidos asignados, navega a entregas y cierra tu turno con corte de liquidación diario.
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Selecciona tu Perfil de Repartidor:
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {couriers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} • {r.modeloVehiculo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  PIN de Conductor (Demo: 1234):
                </label>
                <input
                  type="password"
                  required
                  value={driverPin}
                  onChange={(e) => {
                    setDriverPin(e.target.value);
                    setDriverError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs font-mono"
                />
              </div>

              {driverError && (
                <div className="text-rose-400 text-[11px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{driverError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 text-white font-black text-xs transition shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                Ingresar como Repartidor
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
