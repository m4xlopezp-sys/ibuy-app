import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  X, 
  Phone, 
  User, 
  Bike, 
  ShieldCheck, 
  ExternalLink, 
  Bell, 
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { WhatsAppNotification } from '../types/ibuy';

interface WhatsAppNotificationCenterProps {
  notifications: WhatsAppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onClearNotifications?: () => void;
  latestNotification?: WhatsAppNotification | null;
}

export const WhatsAppNotificationCenter: React.FC<WhatsAppNotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onClearNotifications,
  latestNotification
}) => {
  const [filterRole, setFilterRole] = useState<'todos' | 'cliente' | 'repartidor' | 'administrador'>('todos');

  const filtered = notifications.filter(n => {
    if (filterRole === 'todos') return true;
    return n.destinatario === filterRole;
  });

  const getRecipientBadge = (dest: 'cliente' | 'repartidor' | 'administrador') => {
    switch (dest) {
      case 'cliente':
        return { label: 'Cliente', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: User };
      case 'repartidor':
        return { label: 'Repartidor', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Bike };
      case 'administrador':
        return { label: 'Administrador', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldCheck };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border-l sm:border border-slate-800 sm:rounded-3xl w-full max-w-md h-full sm:h-[90vh] shadow-2xl flex flex-col relative overflow-hidden">
        {/* WhatsApp-style Header */}
        <div className="bg-emerald-900/40 border-b border-emerald-800/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Notificaciones de WhatsApp</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                Historial de alertas automáticas vía API de WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-3 bg-slate-950 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'cliente', label: 'Al Cliente' },
            { id: 'repartidor', label: 'Al Repartidor' },
            { id: 'administrador', label: 'Al Administrador' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                filterRole === tab.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-xs">No hay mensajes de WhatsApp registrados aún</p>
              <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
                Los mensajes se disparan al crear pedidos, al cambiar estatus el repartidor o al cerrar turno.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const badge = getRecipientBadge(item.destinatario);
              const Icon = badge.icon;
              const cleanPhone = item.telefono.replace(/\D/g, '');
              const waLink = `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(item.mensaje)}`;

              return (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 relative group hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{badge.label}: {item.destinatarioNombre}</span>
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>

                  {/* WhatsApp chat bubble */}
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-200 leading-relaxed font-sans relative">
                    <p className="whitespace-pre-line text-[11.5px] text-emerald-100/90">
                      {item.mensaje}
                    </p>
                    <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-emerald-400">
                      <span>Enviado</span>
                      <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                  </div>

                  {/* Action link */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500 font-mono">
                      📞 {item.telefono}
                    </span>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition cursor-pointer shadow-sm"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir en WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && onClearNotifications && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
            <button
              onClick={onClearNotifications}
              className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Limpiar historial de notificaciones
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
