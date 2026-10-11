import React, { useState } from 'react';
import { 
  Bike, 
  UserPlus, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  MessageSquare,
  Car,
  Search,
  Filter
} from 'lucide-react';
import { Courier, Candidate } from '../types/ibuy';

interface RecruitmentModuleProps {
  candidates: Candidate[];
  couriers: Courier[];
  onUpdateCandidateStatus: (id: string, status: Candidate['estado']) => void;
  onAddCandidate: (cand: Omit<Candidate, 'id'>) => void;
}

export const RecruitmentModule: React.FC<RecruitmentModuleProps> = ({
  candidates,
  couriers,
  onUpdateCandidateStatus,
  onAddCandidate
}) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'fleet'>('candidates');
  const [search, setSearch] = useState('');
  const [newApplicantModal, setNewApplicantModal] = useState(false);
  const [applicantForm, setApplicantForm] = useState({
    nombre: '',
    telefono: '',
    vehiculo: 'Moto Italika 150',
    mensajeOriginal: 'Solicitud manual registrada desde panel operativo IBUY'
  });

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantForm.nombre || !applicantForm.telefono) return;
    onAddCandidate({
      nombre: applicantForm.nombre,
      telefono: applicantForm.telefono,
      vehiculo: applicantForm.vehiculo,
      fechaSolicitud: 'Hoy, hace un momento',
      estado: 'NUEVO',
      mensajeOriginal: applicantForm.mensajeOriginal
    });
    setApplicantForm({
      nombre: '',
      telefono: '',
      vehiculo: 'Moto Italika 150',
      mensajeOriginal: 'Solicitud manual registrada desde panel operativo IBUY'
    });
    setNewApplicantModal(false);
  };

  const filteredCandidates = candidates.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.nombre.toLowerCase().includes(q) || c.telefono.includes(q) || c.vehiculo.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-orange-500/20 text-orange-400">
              <Bike className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Flotilla Activa & Captura de Reclutamiento IBUY
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Cada vez que un usuario escribe con intención de trabajo ("quiero trabajar", "tengo moto"), el motor clasifica
            la acción como <strong className="text-slate-200">RECLUTAMIENTO</strong> y lo registra automáticamente aquí.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'candidates'
                  ? 'bg-orange-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aspirantes Capturados ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'fleet'
                  ? 'bg-orange-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Flotilla Activa ({couriers.length})
            </button>
          </div>

          <button
            onClick={() => setNewApplicantModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-orange-400" />
            <span>Nuevo Aspirante</span>
          </button>
        </div>
      </div>

      {/* Tab: Candidates Inbox */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Aspirante a Repartidor</span>
                    <h3 className="font-bold text-white text-base leading-snug">{cand.nombre}</h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    cand.estado === 'NUEVO'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : cand.estado === 'CONTACTADO'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : cand.estado === 'APROBADO'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {cand.estado}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Vehículo:</span>
                    <span className="font-semibold text-orange-400">{cand.vehiculo}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Teléfono:</span>
                    <span className="font-mono text-slate-200">{cand.telefono}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Fecha captura:</span>
                    <span className="text-slate-400 text-[11px]">{cand.fechaSolicitud}</span>
                  </div>
                </div>

                {cand.mensajeOriginal && (
                  <div className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    "{cand.mensajeOriginal}"
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/52${cand.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hola ${cand.nombre}, te contactamos de IBUY Coatepec de Harinas. Recibimos tu solicitud para ingresar como repartidor con tu ${cand.vehiculo}. ¿Tendrías disponibilidad para una breve entrevista?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onUpdateCandidateStatus(cand.id, 'CONTACTADO')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <select
                    value={cand.estado}
                    onChange={(e) => onUpdateCandidateStatus(cand.id, e.target.value as Candidate['estado'])}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-500"
                  >
                    <option value="NUEVO">Nuevo</option>
                    <option value="CONTACTADO">Contactado</option>
                    <option value="EN_CAPACITACION">Capacitación</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="DESCARTADO">Descartado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Fleet Roster */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {couriers.map((courier) => (
            <div
              key={courier.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{courier.nombre}</h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-orange-400" />
                    <span>{courier.modeloVehiculo}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  courier.estado === 'DISPONIBLE'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : courier.estado === 'EN_REPARTO'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {courier.estado}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Placas:</span>
                  <span className="font-mono text-slate-200">{courier.placas || 'En trámite'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Zona Preferente:</span>
                  <span className="text-slate-200 font-semibold">{courier.zonaPreferente}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Entregas Completadas:</span>
                  <span className="font-mono font-bold text-emerald-400">{courier.pedidosCompletados}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Calificación:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {courier.calificacion} / 5.0
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{courier.telefono}</span>
                </span>
                <span className="text-emerald-400 font-medium">Activo en Coatepec</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Applicant Modal */}
      {newApplicantModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Registrar Nuevo Aspirante a Flotilla</h3>
              <button
                onClick={() => setNewApplicantModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 uppercase font-semibold block mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rodrigo Morales"
                  value={applicantForm.nombre}
                  onChange={(e) => setApplicantForm({ ...applicantForm, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase font-semibold block mb-1">Teléfono WhatsApp:</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 722 345 6789"
                  value={applicantForm.telefono}
                  onChange={(e) => setApplicantForm({ ...applicantForm, telefono: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase font-semibold block mb-1">Vehículo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Moto Italika FT150 / Honda Cargo"
                  value={applicantForm.vehiculo}
                  onChange={(e) => setApplicantForm({ ...applicantForm, vehiculo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewApplicantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold"
                >
                  Registrar Aspirante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
