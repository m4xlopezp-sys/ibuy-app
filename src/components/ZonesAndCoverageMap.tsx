import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Clock, 
  DollarSign, 
  Store, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  CheckCircle2, 
  XCircle,
  Phone,
  Calculator,
  Navigation
} from 'lucide-react';
import { ZONAS_COATEPEC, COMERCIOS_COATEPEC } from '../data/ibuyData';
import { isStoreOpen } from '../utils/nlpEngine';
import { ZonaId } from '../types/ibuy';

interface ZonesAndCoverageMapProps {
  simulatedTime: string;
}

export const ZonesAndCoverageMap: React.FC<ZonesAndCoverageMapProps> = ({ simulatedTime }) => {
  const [selectedZone, setSelectedZone] = useState<ZonaId>('Zona 1');
  const [searchCommerce, setSearchCommerce] = useState('');
  const [calcOrigin, setCalcOrigin] = useState('Centro Coatepec');
  const [calcDestZone, setCalcDestZone] = useState<ZonaId>('Zona 3');

  const filteredBusinesses = COMERCIOS_COATEPEC.filter(b => {
    if (!searchCommerce.trim()) return true;
    const q = searchCommerce.toLowerCase();
    return b.nombre.toLowerCase().includes(q) || b.categoria.toLowerCase().includes(q) || b.direccion.toLowerCase().includes(q);
  });

  const destZoneConfig = ZONAS_COATEPEC[calcDestZone];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-orange-500/20 text-orange-400">
                <Compass className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Zonas de Cobertura, Tarifas & Directorio de Comercios
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Configuración de las 4 zonas tarifarias de Coatepec de Harinas y validación en vivo de horarios comerciales 
              según la hora del sistema ({simulatedTime} hrs).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400 block text-[10px]">Hora actual para horarios:</span>
              <span className="font-mono font-bold text-amber-300">{simulatedTime} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Zones Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(ZONAS_COATEPEC) as ZonaId[]).map((zoneKey) => {
          const zone = ZONAS_COATEPEC[zoneKey];
          const isSelected = selectedZone === zoneKey;

          return (
            <div
              key={zoneKey}
              onClick={() => setSelectedZone(zoneKey)}
              className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-orange-500 shadow-lg shadow-orange-500/10'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                    zoneKey === 'Zona 1'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : zoneKey === 'Zona 2'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : zoneKey === 'Zona 3'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {zone.id}
                  </span>
                  <span className="font-mono font-bold text-sm text-white">
                    {zone.rangoTarifa}
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm">{zone.nombre}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{zone.descripcion}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                    Comunidades Principales:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {zone.comunidades.slice(0, 4).map((com, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                        {com}
                      </span>
                    ))}
                    {zone.comunidades.length > 4 && (
                      <span className="text-[10px] text-orange-400 font-mono px-1">
                        +{zone.comunidades.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {zone.tiempoEstimado}
                </span>
                <span className="text-orange-400 font-medium">Ver detalles →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Zone Deep Dive & Shipping Fare Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Zone Communities Complete List (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">
                Desglose Territorial
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{ZONAS_COATEPEC[selectedZone].nombre}</span>
                <span className="text-xs font-mono font-normal text-slate-400">
                  ({ZONAS_COATEPEC[selectedZone].rangoTarifa})
                </span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Tarifa Base</span>
              <span className="text-emerald-400 font-mono font-bold text-base">
                ${ZONAS_COATEPEC[selectedZone].tarifaBase} MXN
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Todas las comunidades y rancherías catalogadas en {selectedZone}:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ZONAS_COATEPEC[selectedZone].comunidades.map((community, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <span className="truncate">{community}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-200">Regla de Negocio para el Repartidor:</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              En {selectedZone}, el repartidor percibe el 85% de la tarifa de envío (${(ZONAS_COATEPEC[selectedZone].tarifaBase * 0.85).toFixed(0)} MXN) 
              y la plataforma retiene el 15% para soporte operativo y garantía de entrega.
            </p>
          </div>
        </div>

        {/* Right: Quick Shipping Calculator (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <Calculator className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Calculadora Rápida de Envío IBUY</h3>
              <p className="text-[11px] text-slate-400">Simula cotización para cualquier destino de la región</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Punto de Origen (Comercio / Recolección):
              </label>
              <input
                type="text"
                value={calcOrigin}
                onChange={(e) => setCalcOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Zona de Destino:
              </label>
              <select
                value={calcDestZone}
                onChange={(e) => setCalcDestZone(e.target.value as ZonaId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500 text-xs"
              >
                <option value="Zona 1">Zona 1: Cabecera Municipal ($25)</option>
                <option value="Zona 2">Zona 2: Colonias Periféricas ($35 - $45)</option>
                <option value="Zona 3">Zona 3: Comunidades y Rancherías ($50 - $70)</option>
                <option value="Zona 4">Zona 4: Municipios Vecinos ($80 - $120)</option>
              </select>
            </div>
          </div>

          {/* Calculator Output Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Tarifa de Envío Recomendada:</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                ${destZoneConfig.tarifaBase} MXN
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Tiempo Estimado de Entrega:</span>
              <span className="font-semibold text-slate-200">{destZoneConfig.tiempoEstimado}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Ganancia Neta para el Repartidor:</span>
              <span className="font-mono text-slate-200">${(destZoneConfig.tarifaBase * 0.85).toFixed(0)} MXN</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Comisión IBUY (15%):</span>
              <span className="font-mono text-orange-400">${(destZoneConfig.tarifaBase * 0.15).toFixed(0)} MXN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Directory of Local Establishments & Real-Time Open/Closed Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-orange-500/20 text-orange-400">
                <Store className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white">Directorio de Comercios de Coatepec</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Validación en vivo de horarios para el motor IBUY según la hora simulada ({simulatedTime} hrs).
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar por comercio o categoría..."
              value={searchCommerce}
              onChange={(e) => setSearchCommerce(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBusinesses.map((biz) => {
            const open = isStoreOpen(biz.horarioApertura, biz.horarioCierre, biz.es24Horas, simulatedTime);

            return (
              <div
                key={biz.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {biz.categoria}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {biz.nombre}
                    </h4>
                  </div>

                  {open ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Abierto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <XCircle className="w-3 h-3" />
                      Cerrado
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>
                    Horario: {biz.es24Horas ? '24 Horas' : `${biz.horarioApertura} - ${biz.horarioCierre} hrs`}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{biz.direccion}</span>
                </div>

                {biz.requiereConfirmacionStockDefault && (
                  <div className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1 pt-1 border-t border-slate-900">
                    <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Requiere verificación de stock en mostrador</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
