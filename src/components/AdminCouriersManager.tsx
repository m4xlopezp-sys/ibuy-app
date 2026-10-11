import React, { useState } from 'react';
import { 
  Bike, 
  Plus, 
  Trash2, 
  Edit3, 
  Phone, 
  ShieldCheck, 
  Star, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Search, 
  Radio, 
  KeyRound, 
  DollarSign, 
  Clock, 
  MapPin,
  Sparkles,
  UserX,
  UserCheck
} from 'lucide-react';
import { Courier, ZonaId } from '../types/ibuy';

interface AdminCouriersManagerProps {
  couriers: Courier[];
  onAddCourier: (newCourier: Courier) => void;
  onUpdateCourier: (updatedCourier: Courier) => void;
  onDeleteCourier: (id: string) => void;
  onReorderCouriers: (reordered: Courier[]) => void;
}

export const AdminCouriersManager: React.FC<AdminCouriersManagerProps> = ({
  couriers,
  onAddCourier,
  onUpdateCourier,
  onDeleteCourier,
  onReorderCouriers
}) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);

  const [form, setForm] = useState<{
    nombre: string;
    telefono: string;
    vehiculo: 'Moto' | 'Auto' | 'Bici';
    modeloVehiculo: string;
    placas: string;
    zonaPreferente: ZonaId;
    estado: 'DISPONIBLE' | 'EN_REPARTO' | 'DESCONECTADO';
    pinAcceso: string;
    foto?: string;
  }>({
    nombre: '',
    telefono: '',
    vehiculo: 'Moto',
    modeloVehiculo: 'Italika FT150 Roja',
    placas: '',
    zonaPreferente: 'Zona 1',
    estado: 'DISPONIBLE',
    pinAcceso: '1234',
    foto: ''
  });

  const handleOpenAdd = () => {
    setEditingCourier(null);
    setForm({
      nombre: '',
      telefono: '',
      vehiculo: 'Moto',
      modeloVehiculo: 'Italika 150',
      placas: '',
      zonaPreferente: 'Zona 1',
      estado: 'DISPONIBLE',
      pinAcceso: '1234',
      foto: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Courier) => {
    setEditingCourier(c);
    setForm({
      nombre: c.nombre,
      telefono: c.telefono,
      vehiculo: c.vehiculo,
      modeloVehiculo: c.modeloVehiculo,
      placas: c.placas || '',
      zonaPreferente: c.zonaPreferente || 'Zona 1',
      estado: c.estado,
      pinAcceso: c.pinAcceso || '1234',
      foto: c.foto || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.telefono.trim()) return;

    if (editingCourier) {
      onUpdateCourier({
        ...editingCourier,
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        vehiculo: form.vehiculo,
        modeloVehiculo: form.modeloVehiculo.trim(),
        placas: form.placas.trim() || 'S/P',
        zonaPreferente: form.zonaPreferente,
        estado: form.estado,
        pinAcceso: form.pinAcceso.trim() || '1234',
        foto: form.foto?.trim() || undefined
      });
    } else {
      const newCourier: Courier = {
        id: `rep-${Date.now()}`,
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        vehiculo: form.vehiculo,
        modeloVehiculo: form.modeloVehiculo.trim(),
        placas: form.placas.trim() || 'S/P',
        estado: form.estado,
        pedidosCompletados: 0,
        calificacion: 5.0,
        zonaPreferente: form.zonaPreferente,
        lat: 18.9250,
        lng: -99.7680,
        ubicacionActual: 'Base Operativa Coatepec',
        pinAcceso: form.pinAcceso.trim() || '1234',
        foto: form.foto?.trim() || undefined
      };
      onAddCourier(newCourier);
    }
    setModalOpen(false);
  };

  // Reordering functions
  const moveUp = (id: string) => {
    const idx = couriers.findIndex(c => c.id === id);
    if (idx <= 0) return;
    const next = [...couriers];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    onReorderCouriers(next);
  };

  const moveDown = (id: string) => {
    const idx = couriers.findIndex(c => c.id === id);
    if (idx < 0 || idx >= couriers.length - 1) return;
    const next = [...couriers];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    onReorderCouriers(next);
  };

  const toggleEstado = (c: Courier) => {
    const nextEstado: 'DISPONIBLE' | 'DESCONECTADO' = 
      c.estado === 'DISPONIBLE' ? 'DESCONECTADO' : 'DISPONIBLE';
    onUpdateCourier({
      ...c,
      estado: nextEstado
    });
  };

  const filteredCouriers = couriers.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.telefono.toLowerCase().includes(q) ||
      c.modeloVehiculo.toLowerCase().includes(q) ||
      c.zonaPreferente.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Bike className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">
              Gestión y Orden de Repartidores
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Control de altas, bajas y modificación de perfiles de trabajadores. Organiza su orden de asignación en la Torre de Control y supervisa calificaciones y turnos.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Dar de Alta Nuevo Repartidor</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, vehículo o zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Trabajadores:</span>
          <span className="text-sm font-black text-white">{couriers.length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-emerald-400">Disponibles en Turno:</span>
          <span className="text-sm font-black text-emerald-400">
            {couriers.filter(c => c.estado === 'DISPONIBLE').length}
          </span>
        </div>
      </div>

      {/* Couriers List with Ordering */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <span>Plantilla de Repartidores Activa ({filteredCouriers.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Usa las flechas para subir/bajar el orden de prioridad en Torre de Control
          </span>
        </div>

        <div className="space-y-3">
          {filteredCouriers.map((c, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredCouriers.length - 1;

            return (
              <div
                key={c.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Courier info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 text-lg font-black">
                    {c.foto ? (
                      <img src={c.foto} alt={c.nombre} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Bike className="w-6 h-6" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        #{index + 1}
                      </span>
                      <h4 className="font-black text-white text-sm truncate">{c.nombre}</h4>
                      
                      {/* Estado badge */}
                      <button
                        onClick={() => toggleEstado(c)}
                        title="Clic para cambiar estado rápido"
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer transition ${
                          c.estado === 'DISPONIBLE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : c.estado === 'EN_REPARTO'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {c.estado === 'DISPONIBLE' ? '● Disponible' : c.estado === 'EN_REPARTO' ? '● En Reparto' : '○ Desconectado'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span className="font-mono text-slate-300">{c.telefono}</span>
                      </span>
                      <span>•</span>
                      <span>{c.vehiculo}: {c.modeloVehiculo} ({c.placas || 'S/P'})</span>
                      <span>•</span>
                      <span className="text-orange-400 font-bold">{c.zonaPreferente || 'Zona 1'}</span>
                    </div>

                    {/* Stats & Shift info */}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {c.calificacion?.toFixed(1) || '5.0'} ({c.pedidosCompletados || 0} entregas)
                      </span>
                      {c.corteDelDia && (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded font-mono">
                          Corte hoy: ${c.corteDelDia.totalEfectivo} MXN ({c.corteDelDia.horaCierre} hrs)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions & Reordering Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Order controls */}
                  <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
                    <button
                      onClick={() => moveUp(c.id)}
                      disabled={isFirst}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-25 transition cursor-pointer"
                      title="Subir prioridad"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(c.id)}
                      disabled={isLast}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-25 transition cursor-pointer"
                      title="Bajar prioridad"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit Profile */}
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Modificar</span>
                  </button>

                  {/* Delete Profile */}
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro que deseas dar de baja al repartidor "${c.nombre}"?`)) {
                        onDeleteCourier(c.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Dar de baja trabajador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredCouriers.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No se encontraron repartidores con el filtro especificado.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add / Edit Courier */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-white text-base">
                {editingCourier ? `Modificar Perfil: ${editingCourier.nombre}` : 'Dar de Alta Nuevo Repartidor'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-slate-400 uppercase font-bold block mb-1">Nombre Completo del Trabajador:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Sánchez García"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Teléfono WhatsApp:</label>
                  <input
                    type="tel"
                    required
                    placeholder="722-123-4567"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">PIN de Acceso (4 dígitos):</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={form.pinAcceso}
                    onChange={(e) => setForm({ ...form, pinAcceso: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-center font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Vehículo:</label>
                  <select
                    value={form.vehiculo}
                    onChange={(e) => setForm({ ...form, vehiculo: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Moto">Moto</option>
                    <option value="Auto">Auto</option>
                    <option value="Bici">Bicicleta</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-slate-400 uppercase font-bold block mb-1">Modelo y Color:</label>
                  <input
                    type="text"
                    placeholder="Ej. Yamaha YBR 125 Azul"
                    value={form.modeloVehiculo}
                    onChange={(e) => setForm({ ...form, modeloVehiculo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Placas de Circulación:</label>
                  <input
                    type="text"
                    placeholder="Ej. T56-ZZA"
                    value={form.placas}
                    onChange={(e) => setForm({ ...form, placas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Zona Territorial Asignada:</label>
                  <select
                    value={form.zonaPreferente}
                    onChange={(e) => setForm({ ...form, zonaPreferente: e.target.value as ZonaId })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Zona 1">Zona 1: Cabecera</option>
                    <option value="Zona 2">Zona 2: Periférica</option>
                    <option value="Zona 3">Zona 3: Rancherías</option>
                    <option value="Zona 4">Zona 4: Municipios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase font-bold block mb-1">Estado Operativo:</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="DISPONIBLE">🟢 DISPONIBLE (Listo para recibir pedidos)</option>
                  <option value="EN_REPARTO">🟡 EN_REPARTO (Actualmente en ruta)</option>
                  <option value="DESCONECTADO">⚪ DESCONECTADO (Fuera de turno)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                  {editingCourier ? 'Guardar Cambios' : 'Registrar Repartidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
