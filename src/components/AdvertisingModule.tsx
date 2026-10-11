import React, { useState } from 'react';
import { 
  Megaphone, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Store,
  Tag,
  Gift
} from 'lucide-react';
import { PATROCINIOS_DESTACADOS } from '../data/ibuyData';

export const AdvertisingModule: React.FC = () => {
  const [sponsors, setSponsors] = useState(
    PATROCINIOS_DESTACADOS.map((s, idx) => ({
      id: `spon-${idx + 1}`,
      negocio: s.negocio,
      mensaje: s.mensaje,
      impresiones: 1240 + idx * 340,
      clicks: 86 + idx * 28,
      tarifaMensual: 500,
      activo: true
    }))
  );

  const [newSponsorModal, setNewSponsorModal] = useState(false);
  const [form, setForm] = useState({
    negocio: '',
    mensaje: ''
  });

  const handleToggle = (id: string) => {
    setSponsors(sponsors.map(s => s.id === id ? { ...s, activo: !s.activo } : s));
  };

  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.negocio || !form.mensaje) return;
    setSponsors([
      ...sponsors,
      {
        id: `spon-${Date.now()}`,
        negocio: form.negocio,
        mensaje: form.mensaje,
        impresiones: 0,
        clicks: 0,
        tarifaMensual: 500,
        activo: true
      }
    ]);
    setForm({ negocio: '', mensaje: '' });
    setNewSponsorModal(false);
  };

  const totalRevenue = sponsors.filter(s => s.activo).length * 500;
  const totalImpressions = sponsors.reduce((acc, s) => acc + s.impresiones, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-orange-500/20 text-orange-400">
              <Megaphone className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Motor de Publicidad & Monetización IBUY
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Regla de Negocio: En cada respuesta válida de pedido o consulta emitida por el asistente, 
            se inyecta un objeto <strong className="text-slate-200">promocion_patrocinada</strong> para generar ingresos 
            por pauta publicitaria a comercios locales de Coatepec.
          </p>
        </div>

        <button
          onClick={() => setNewSponsorModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Comercio Patrocinador</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Ingresos Mensuales por Patrocinios
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ${totalRevenue.toLocaleString()} MXN
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {sponsors.filter(s => s.activo).length} comercios activos a $500 MXN/mes
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Impresiones en Chats de Pedidos
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {totalImpressions.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Recomendaciones inyectadas en formato JSON
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Tasa de Conversión Estimada
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            6.8% CTR
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Clientes que agregaron la oferta del patrocinador
          </p>
        </div>
      </div>

      {/* Active Sponsors Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Gift className="w-4 h-4 text-orange-400" />
          <span>Campañas Patrocinadas en Rotación Automática</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className={`p-4 rounded-xl border transition ${
                sponsor.activo
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <span className="text-[10px] text-orange-400 uppercase font-bold">Comercio Patrocinador</span>
                  <h4 className="font-bold text-white text-base">{sponsor.negocio}</h4>
                </div>

                <button
                  onClick={() => handleToggle(sponsor.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border transition cursor-pointer ${
                    sponsor.activo
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {sponsor.activo ? 'Activo en Motor' : 'Pausado'}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 italic mb-3">
                "{sponsor.mensaje}"
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">Impresiones:</span>
                  <strong className="text-slate-200 font-mono">{sponsor.impresiones}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Interacciones:</span>
                  <strong className="text-slate-200 font-mono">{sponsor.clicks}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Cuota IBUY:</span>
                  <strong className="text-emerald-400 font-mono">${sponsor.tarifaMensual} MXN/mes</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal New Sponsor */}
      {newSponsorModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Registrar Comercio Patrocinador</h3>
              <button
                onClick={() => setNewSponsorModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSponsor} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 uppercase font-semibold block mb-1">Nombre del Comercio:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Taquería El Paisa Coatepec"
                  value={form.negocio}
                  onChange={(e) => setForm({ ...form, negocio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase font-semibold block mb-1">Texto de la Oferta del Día (Llamativo):</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej. 10% de descuento en tacos de pastor al ordenar tu envío por IBUY."
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewSponsorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold"
                >
                  Guardar y Activar Pauta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
