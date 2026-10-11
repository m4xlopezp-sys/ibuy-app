import React, { useState } from 'react';
import { 
  Compass, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  DollarSign, 
  Bike, 
  MapPin, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Save, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  Users,
  Settings,
  Calendar,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { ZonaConfig, ServiceScheduleConfig, Courier, ZonaId } from '../types/ibuy';

interface AdminZonesManagerProps {
  zones: ZonaConfig[];
  onAddZone: (newZone: ZonaConfig) => void;
  onUpdateZone: (updatedZone: ZonaConfig) => void;
  onDeleteZone: (zoneId: string) => void;
  onReorderZones?: (reorderedZones: ZonaConfig[]) => void;
  serviceSchedule: ServiceScheduleConfig;
  onUpdateServiceSchedule: (schedule: ServiceScheduleConfig) => void;
  couriers?: Courier[];
  onAddCourier?: (newCourier: Courier) => void;
}

export const AdminZonesManager: React.FC<AdminZonesManagerProps> = ({
  zones,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
  onReorderZones,
  serviceSchedule,
  onUpdateServiceSchedule,
  couriers = [],
  onAddCourier
}) => {
  const [activeTab, setActiveTab] = useState<'service_schedule' | 'zones'>('zones');

  // Service Schedule edit form
  const [scheduleForm, setScheduleForm] = useState<ServiceScheduleConfig>(serviceSchedule);
  const [scheduleSavedToast, setScheduleSavedToast] = useState(false);

  // Zone add/edit state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneForm, setZoneForm] = useState<{
    id: string;
    nombre: string;
    tarifaEnvio: number;
    tiempoEstimadoMinutos: string;
    comunidadesText: string;
    descripcion: string;
    color: string;
  }>({
    id: '',
    nombre: '',
    tarifaEnvio: 35,
    tiempoEstimadoMinutos: '20-30 min',
    comunidadesText: '',
    descripcion: '',
    color: 'emerald'
  });

  // Schedule Save handler
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateServiceSchedule(scheduleForm);
    setScheduleSavedToast(true);
    setTimeout(() => setScheduleSavedToast(false), 3000);
  };

  // Open Add Zone
  const handleOpenAddZone = () => {
    const nextZoneNum = zones.length + 1;
    setEditingZoneId(null);
    setZoneForm({
      id: `Zona ${nextZoneNum}`,
      nombre: `Zona ${nextZoneNum} - Nueva Área`,
      tarifaEnvio: 45,
      tiempoEstimadoMinutos: '25-35 min',
      comunidadesText: 'Comunidad Ejemplo, Barrio Central',
      descripcion: 'Área de reparto configurada por el administrador',
      color: 'blue'
    });
    setIsZoneModalOpen(true);
  };

  // Open Edit Zone
  const handleOpenEditZone = (z: ZonaConfig) => {
    setEditingZoneId(z.id);
    setZoneForm({
      id: z.id,
      nombre: z.nombre,
      tarifaEnvio: z.tarifaEnvio,
      tiempoEstimadoMinutos: z.tiempoEstimadoMinutos,
      comunidadesText: z.comunidades.join(', '),
      descripcion: z.descripcion,
      color: z.color || 'blue'
    });
    setIsZoneModalOpen(true);
  };

  // Submit Zone (Add or Edit)
  const handleSubmitZone = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedComunidades = zoneForm.comunidadesText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const zoneObject: ZonaConfig = {
      id: zoneForm.id,
      nombre: zoneForm.nombre,
      tarifaEnvio: Number(zoneForm.tarifaEnvio) || 25,
      tiempoEstimadoMinutos: zoneForm.tiempoEstimadoMinutos,
      comunidades: parsedComunidades.length > 0 ? parsedComunidades : ['Área General'],
      descripcion: zoneForm.descripcion,
      color: zoneForm.color,
      activa: true
    };

    if (editingZoneId) {
      onUpdateZone(zoneObject);
    } else {
      onAddZone(zoneObject);
    }
    setIsZoneModalOpen(false);
  };

  const moveUpZone = (zoneId: string) => {
    if (!onReorderZones) return;
    const idx = zones.findIndex(z => z.id === zoneId);
    if (idx <= 0) return;
    const next = [...zones];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    onReorderZones(next);
  };

  const moveDownZone = (zoneId: string) => {
    if (!onReorderZones) return;
    const idx = zones.findIndex(z => z.id === zoneId);
    if (idx < 0 || idx >= zones.length - 1) return;
    const next = [...zones];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    onReorderZones(next);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white">
              Gestión y Orden de Zonas
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Sube, modifica o elimina zonas de entrega y sus tarifas de envío. Ajusta el orden de aparición y configura el horario de apertura y cierre del servicio.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'zones'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Zonas & Tarifas ({zones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('service_schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'service_schedule'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Horarios del Servicio</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ZONAS Y TARIFAS DE ENVÍO */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-400" />
                <span>Zonas de Cobertura y Costos de Envío Configurados</span>
              </h3>
              <p className="text-xs text-slate-400">
                Puedes agregar nuevas zonas o eliminar/ajustar los costos. El sistema recalcula automáticamente los envíos para los clientes.
              </p>
            </div>

            <button
              onClick={handleOpenAddZone}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Nueva Zona</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {zone.id}
                    </span>

                    <span className="font-mono text-base font-black text-emerald-400">
                      ${zone.tarifaEnvio} MXN
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm">{zone.nombre}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{zone.descripcion}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Comunidades Incluidas ({zone.comunidades.length}):
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {zone.comunidades.map((com, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                          {com}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {zone.tiempoEstimadoMinutos}
                  </span>

                  <div className="flex items-center gap-1">
                    {onReorderZones && (
                      <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                        <button
                          onClick={() => moveUpZone(zone.id)}
                          disabled={zones.findIndex(z => z.id === zone.id) === 0}
                          title="Subir orden"
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveDownZone(zone.id)}
                          disabled={zones.findIndex(z => z.id === zone.id) === zones.length - 1}
                          title="Bajar orden"
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenEditZone(zone)}
                      title="Editar Zona y Tarifa"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteZone(zone.id)}
                      title="Quitar Zona"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HORARIO DEL SERVICIO GENERAL IBUY */}
      {activeTab === 'service_schedule' && (
        <form onSubmit={handleSaveSchedule} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span>Configuración de Horario General del Servicio IBUY</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Establece las horas en las que los clientes pueden realizar pedidos y el estado operativo de la plataforma.
            </p>
          </div>

          {/* Toggle Service Active */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-sm font-bold text-white block">Estado del Servicio IBUY</span>
              <span className="text-xs text-slate-400">
                {scheduleForm.servicioActivo ? '🟢 Servicio ACTIVO recibiendo pedidos' : '🔴 Servicio CERRADO temporalmente'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setScheduleForm(prev => ({ ...prev, servicioActivo: !prev.servicioActivo }))}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                scheduleForm.servicioActivo
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {scheduleForm.servicioActivo ? 'En Operación (Abierto)' : 'Pausado (Cerrado)'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Horario de Apertura
              </label>
              <input
                type="text"
                value={scheduleForm.horarioApertura}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, horarioApertura: e.target.value }))}
                placeholder="08:00"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Horario de Cierre
              </label>
              <input
                type="text"
                value={scheduleForm.horarioCierre}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, horarioCierre: e.target.value }))}
                placeholder="22:00"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Días de Operación
              </label>
              <input
                type="text"
                value={scheduleForm.diasOperacion}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, diasOperacion: e.target.value }))}
                placeholder="Lunes a Domingo"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp del Administrador (Alertas de Cierre y Pedidos)
              </label>
              <input
                type="text"
                value={scheduleForm.adminWhatsApp}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, adminWhatsApp: e.target.value }))}
                placeholder="722 450 1100"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mensaje al Cliente cuando esté fuera de horario
            </label>
            <textarea
              rows={2}
              value={scheduleForm.mensajeFueraDeHorario || ''}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, mensajeFueraDeHorario: e.target.value }))}
              placeholder="El servicio de entregas se encuentra cerrado..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {scheduleSavedToast ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Horario actualizado exitosamente</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Horario del Servicio</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL: AGREGAR O EDITAR ZONA */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsZoneModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleSubmitZone} className="space-y-4">
              <div>
                <h3 className="text-base font-black text-white">
                  {editingZoneId ? `Editar ${zoneForm.id}` : 'Agregar Nueva Zona de Envío'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configura el nombre, el costo de entrega en MXN y las comunidades.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Identificador de Zona (ej. Zona 1, Zona 5)
                </label>
                <input
                  type="text"
                  required
                  value={zoneForm.id}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Zona 5"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Descriptivo
                </label>
                <input
                  type="text"
                  required
                  value={zoneForm.nombre}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Comunidades del Norte"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Costo de Envío ($ MXN)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    required
                    value={zoneForm.tarifaEnvio}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, tarifaEnvio: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tiempo Estimado
                  </label>
                  <input
                    type="text"
                    value={zoneForm.tiempoEstimadoMinutos}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, tiempoEstimadoMinutos: e.target.value }))}
                    placeholder="25-35 min"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Comunidades (Separadas por comas)
                </label>
                <textarea
                  rows={3}
                  value={zoneForm.comunidadesText}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, comunidadesText: e.target.value }))}
                  placeholder="Meyuca, Tepehuajes, El Salto..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={zoneForm.descripcion}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Breve descripción del área de cobertura"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  Guardar Zona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
