import React, { useState } from 'react';
import { 
  Star, 
  Bike, 
  Store, 
  CheckCircle2, 
  X, 
  Heart, 
  MessageSquare, 
  ThumbsUp,
  Sparkles
} from 'lucide-react';
import { DispatchedOrder, CalificacionPedido } from '../types/ibuy';

interface RatingModalProps {
  isOpen: boolean;
  order: DispatchedOrder;
  onClose: () => void;
  onSubmitRating: (orderId: string, rating: CalificacionPedido) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  order,
  onClose,
  onSubmitRating
}) => {
  const [starsRepartidor, setStarsRepartidor] = useState<number>(
    order.calificacion?.estrellasRepartidor || 5
  );
  const [commentRepartidor, setCommentRepartidor] = useState<string>(
    order.calificacion?.comentarioRepartidor || ''
  );
  const [selectedTagRepartidor, setSelectedTagRepartidor] = useState<string>('');

  const [starsNegocio, setStarsNegocio] = useState<number>(
    order.calificacion?.estrellasNegocio || 5
  );
  const [commentNegocio, setCommentNegocio] = useState<string>(
    order.calificacion?.comentarioNegocio || ''
  );
  const [selectedTagNegocio, setSelectedTagNegocio] = useState<string>('');

  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const driverTags = [
    'Rápido y puntual ⚡',
    'Muy amable y educado 🤝',
    'Comida intacta y caliente 🍲',
    'Excelente comunicación 💬',
    'Ubicó fácil mi casa 📍'
  ];

  const storeTags = [
    'Sabor delicioso 😋',
    'Porción abundante 🍽️',
    'Empaque impecable y sellado 📦',
    'Temperatura perfecta 🔥',
    'Gran calidad de ingredientes ✨'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCommentRep = selectedTagRepartidor 
      ? `${selectedTagRepartidor}${commentRepartidor ? ` - ${commentRepartidor}` : ''}`
      : commentRepartidor;

    const finalCommentNeg = selectedTagNegocio 
      ? `${selectedTagNegocio}${commentNegocio ? ` - ${commentNegocio}` : ''}`
      : commentNegocio;

    const ratingData: CalificacionPedido = {
      estrellasRepartidor: starsRepartidor,
      comentarioRepartidor: finalCommentRep,
      estrellasNegocio: starsNegocio,
      comentarioNegocio: finalCommentNeg,
      fechaCalificacion: new Date().toLocaleDateString('es-MX', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setSubmitted(true);
    setTimeout(() => {
      onSubmitRating(order.id, ratingData);
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-white">¡Gracias por tu Calificación!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Tu reseña apoya a los repartidores locales de Coatepec de Harinas y ayuda a que los negocios mantengan su calidad en IBUY.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VALORAR EXPERIENCIA DE ENTREGA</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Califica tu Pedido #{order.id}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tu opinión nos ayuda a premiar a los mejores repartidores y comercios de la región.
              </p>
            </div>

            {/* 1. SECCIÓN REPARTIDOR */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold border border-orange-500/30">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {order.repartidorAsignado || 'Repartidor IBUY'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {order.repartidorVehiculo || 'Repartidor en motocicleta'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStarsRepartidor(star)}
                      className="p-1 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= starsRepartidor
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags rápidas Repartidor */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {driverTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTagRepartidor(prev => prev === tag ? '' : tag)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                      selectedTagRepartidor === tag
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={commentRepartidor}
                onChange={(e) => setCommentRepartidor(e.target.value)}
                placeholder="Comentario sobre el repartidor (opcional)..."
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 placeholder:text-slate-600"
              />
            </div>

            {/* 2. SECCIÓN ESTABLECIMIENTO */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {order.data.pedido.establecimiento}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Calidad de alimentos y empaque
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStarsNegocio(star)}
                      className="p-1 hover:scale-125 transition cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= starsNegocio
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags rápidas Negocio */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {storeTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTagNegocio(prev => prev === tag ? '' : tag)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                      selectedTagNegocio === tag
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={commentNegocio}
                onChange={(e) => setCommentNegocio(e.target.value)}
                placeholder="Comentario sobre la comida o producto (opcional)..."
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="submit"
                className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Guardar y Enviar Calificación</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
