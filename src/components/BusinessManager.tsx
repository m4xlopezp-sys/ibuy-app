import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Search,
  Sparkles,
  Utensils,
  ShoppingBag,
  ListOrdered,
  Image,
  DollarSign,
  Tag
} from 'lucide-react';
import { Business, ZonaId, ProductItem } from '../types/ibuy';
import { getBusinessCoverImage, BUSINESS_IMAGE_PRESETS } from '../data/ibuyData';

interface BusinessManagerProps {
  businesses: Business[];
  onAddBusiness: (newBiz: Business) => void;
  onUpdateBusiness: (updatedBiz: Business) => void;
  onDeleteBusiness: (id: string) => void;
  onReorderBusinesses: (reordered: Business[]) => void;
}

export const BusinessManager: React.FC<BusinessManagerProps> = ({
  businesses,
  onAddBusiness,
  onUpdateBusiness,
  onDeleteBusiness,
  onReorderBusinesses
}) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);

  // Menu Management State
  const [menuModalBiz, setMenuModalBiz] = useState<Business | null>(null);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<ProductItem | null>(null);
  const [menuItemForm, setMenuItemForm] = useState<{
    nombre: string;
    precio: number;
    descripcion: string;
    categoria: string;
    disponible: boolean;
    requiereStock: boolean;
  }>({
    nombre: '',
    precio: 50,
    descripcion: '',
    categoria: 'General',
    disponible: true,
    requiereStock: false
  });

  const [form, setForm] = useState<Partial<Business>>({
    nombre: '',
    categoria: 'Restaurante',
    descripcionCorta: '',
    imagen: BUSINESS_IMAGE_PRESETS.comida,
    direccion: 'Centro, Coatepec de Harinas',
    telefono: '722-000-0000',
    horarioApertura: '08:00',
    horarioCierre: '20:00',
    es24Horas: false,
    requiereConfirmacionStockDefault: false,
    lat: 18.9250,
    lng: -99.7680,
    zonaUbicacion: 'Zona 1',
    activo: true
  });

  const handleOpenAdd = () => {
    setEditingBiz(null);
    setForm({
      nombre: '',
      categoria: 'Restaurante',
      descripcionCorta: '',
      imagen: BUSINESS_IMAGE_PRESETS.comida,
      direccion: 'Centro, Coatepec de Harinas',
      telefono: '722-000-0000',
      horarioApertura: '08:00',
      horarioCierre: '20:00',
      es24Horas: false,
      requiereConfirmacionStockDefault: false,
      lat: 18.9250,
      lng: -99.7680,
      zonaUbicacion: 'Zona 1',
      activo: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (biz: Business) => {
    setEditingBiz(biz);
    setForm({ 
      ...biz,
      imagen: getBusinessCoverImage(biz)
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre) return;

    if (editingBiz) {
      onUpdateBusiness({
        ...editingBiz,
        ...form
      } as Business);
    } else {
      const defaultImg = form.imagen || getBusinessCoverImage(form);
      const newBiz: Business = {
        id: `biz-${Date.now()}`,
        nombre: form.nombre!,
        categoria: form.categoria || 'Restaurante',
        descripcionCorta: form.descripcionCorta || '',
        imagen: defaultImg,
        icono: '🏪',
        direccion: form.direccion || 'Coatepec de Harinas',
        telefono: form.telefono || '722-000-0000',
        horarioApertura: form.horarioApertura || '08:00',
        horarioCierre: form.horarioCierre || '20:00',
        es24Horas: !!form.es24Horas,
        requiereConfirmacionStockDefault: !!form.requiereConfirmacionStockDefault,
        rating: 4.8,
        tiempoEntregaMin: '20-30 min',
        popularItems: [
          { nombre: 'Platillo / Producto Especial', precioEstimado: 85 }
        ],
        menu: [
          {
            id: `m-${Date.now()}-1`,
            nombre: 'Platillo / Producto Especial',
            descripcion: 'Preparado con ingredientes de la región.',
            precio: 85,
            categoria: 'Especialidades',
            disponible: true
          }
        ],
        lat: form.lat || 18.9250,
        lng: form.lng || -99.7680,
        zonaUbicacion: form.zonaUbicacion || 'Zona 1',
        ordenPrioridad: businesses.length + 1,
        activo: form.activo !== false
      };
      onAddBusiness(newBiz);
    }

    setModalOpen(false);
  };

  // Reordering functions
  const moveUp = (bizId: string) => {
    const idx = businesses.findIndex(b => b.id === bizId);
    if (idx <= 0) return;
    const next = [...businesses];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    const withPriorities = next.map((b, i) => ({ ...b, ordenPrioridad: i + 1 }));
    onReorderBusinesses(withPriorities);
  };

  const moveDown = (bizId: string) => {
    const idx = businesses.findIndex(b => b.id === bizId);
    if (idx < 0 || idx >= businesses.length - 1) return;
    const next = [...businesses];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    const withPriorities = next.map((b, i) => ({ ...b, ordenPrioridad: i + 1 }));
    onReorderBusinesses(withPriorities);
  };

  // Menu Management functions
  const handleOpenMenuManager = (biz: Business) => {
    setMenuModalBiz(biz);
    setIsAddingMenuItem(false);
    setEditingMenuItem(null);
  };

  const handleOpenAddMenuItem = () => {
    setEditingMenuItem(null);
    setMenuItemForm({
      nombre: '',
      precio: 45,
      descripcion: '',
      categoria: 'General',
      disponible: true,
      requiereStock: menuModalBiz?.categoria === 'Farmacia'
    });
    setIsAddingMenuItem(true);
  };

  const handleOpenEditMenuItem = (item: ProductItem) => {
    setEditingMenuItem(item);
    setMenuItemForm({
      nombre: item.nombre,
      precio: item.precio,
      descripcion: item.descripcion,
      categoria: item.categoria || 'General',
      disponible: item.disponible !== false,
      requiereStock: !!item.requiereStock
    });
    setIsAddingMenuItem(true);
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuModalBiz || !menuItemForm.nombre.trim()) return;

    const currentMenu: ProductItem[] = menuModalBiz.menu && menuModalBiz.menu.length > 0 
      ? [...menuModalBiz.menu] 
      : menuModalBiz.popularItems.map((p, i) => ({
          id: `item-${i}`,
          nombre: p.nombre,
          precio: p.precioEstimado,
          descripcion: 'Producto registrado',
          categoria: 'General',
          disponible: true
        }));

    let updatedMenu: ProductItem[];
    if (editingMenuItem) {
      updatedMenu = currentMenu.map(m => m.id === editingMenuItem.id ? {
        ...m,
        nombre: menuItemForm.nombre.trim(),
        precio: Number(menuItemForm.precio) || 10,
        descripcion: menuItemForm.descripcion.trim(),
        categoria: menuItemForm.categoria.trim(),
        disponible: menuItemForm.disponible,
        requiereStock: menuItemForm.requiereStock
      } : m);
    } else {
      const newItem: ProductItem = {
        id: `prod-${Date.now()}`,
        nombre: menuItemForm.nombre.trim(),
        precio: Number(menuItemForm.precio) || 10,
        descripcion: menuItemForm.descripcion.trim(),
        categoria: menuItemForm.categoria.trim() || 'General',
        disponible: menuItemForm.disponible,
        requiereStock: menuItemForm.requiereStock
      };
      updatedMenu = [...currentMenu, newItem];
    }

    const updatedPopular = updatedMenu.slice(0, 4).map(m => ({
      nombre: m.nombre,
      precioEstimado: m.precio
    }));

    const updatedBiz: Business = {
      ...menuModalBiz,
      menu: updatedMenu,
      popularItems: updatedPopular
    };

    onUpdateBusiness(updatedBiz);
    setMenuModalBiz(updatedBiz);
    setIsAddingMenuItem(false);
    setEditingMenuItem(null);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    if (!menuModalBiz) return;
    const currentMenu: ProductItem[] = menuModalBiz.menu || [];
    const updatedMenu = currentMenu.filter(m => m.id !== itemId);
    const updatedPopular = updatedMenu.slice(0, 4).map(m => ({
      nombre: m.nombre,
      precioEstimado: m.precio
    }));

    const updatedBiz: Business = {
      ...menuModalBiz,
      menu: updatedMenu,
      popularItems: updatedPopular.length > 0 ? updatedPopular : [{ nombre: 'Sin platillos', precioEstimado: 0 }]
    };

    onUpdateBusiness(updatedBiz);
    setMenuModalBiz(updatedBiz);
  };

  const filtered = businesses.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.nombre.toLowerCase().includes(q) || b.categoria.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Store className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">
              Gestión y Orden de Negocios
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Sube nuevos comercios, modifica su información, administra y actualiza su menú/platillos en tiempo real, y define el orden de aparición en la tienda.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Subir Nuevo Negocio</span>
        </button>
      </div>

      {/* Search and Counts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Buscar por nombre o giro del negocio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Negocios:</span>
          <span className="text-sm font-black text-white">{businesses.length}</span>
        </div>
      </div>

      {/* Businesses List with Image, Menu & Order Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="font-extrabold text-white text-sm">
            Establecimientos Registrados ({filtered.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            El orden de la lista determina la posición en la vista de clientes
          </span>
        </div>

        <div className="space-y-3">
          {filtered.map((biz, index) => {
            const isFirst = index === 0;
            const isLast = index === filtered.length - 1;
            const coverImg = getBusinessCoverImage(biz);
            const menuCount = biz.menu ? biz.menu.length : biz.popularItems.length;

            return (
              <div
                key={biz.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Business image and summary */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 shrink-0 bg-slate-900 shadow-md relative group">
                    <img
                      src={coverImg}
                      alt={biz.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        #{index + 1}
                      </span>
                      <h4 className="font-black text-white text-sm truncate">{biz.nombre}</h4>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                        {biz.categoria}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {biz.horarioApertura} - {biz.horarioCierre} hrs
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-1 max-w-lg">
                      {biz.descripcionCorta || biz.direccion}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400">
                      <span className="text-slate-300 font-medium">📍 {biz.direccion}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">🗺️ {biz.zonaUbicacion}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">📋 {menuCount} platillos en menú</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Reorder */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {/* Menu Manager Button */}
                  <button
                    onClick={() => handleOpenMenuManager(biz)}
                    className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 hover:text-orange-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Editar y gestionar el menú y platillos de este negocio"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Menú ({menuCount})</span>
                  </button>

                  {/* Move Up / Down Buttons */}
                  <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
                    <button
                      onClick={() => moveUp(biz.id)}
                      disabled={isFirst}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-25 transition cursor-pointer"
                      title="Subir de posición"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(biz.id)}
                      disabled={isLast}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-25 transition cursor-pointer"
                      title="Bajar de posición"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit Info */}
                  <button
                    onClick={() => handleOpenEdit(biz)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                    <span>Modificar</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro que deseas eliminar el negocio "${biz.nombre}" de la plataforma?`)) {
                        onDeleteBusiness(biz.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Eliminar comercio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No se encontraron negocios con la búsqueda ingresada.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add / Edit Business */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-white text-base">
                {editingBiz ? `Modificar Negocio: ${editingBiz.nombre}` : 'Subir Nuevo Negocio a IBUY'}
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
                <label className="text-slate-400 uppercase font-bold block mb-1">Nombre del Establecimiento:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Taquería Los Primos"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Categoría / Giro:</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => {
                      const newCat = e.target.value as any;
                      let suggestedImg = form.imagen;
                      if (newCat === 'Farmacia') suggestedImg = BUSINESS_IMAGE_PRESETS.farmacia;
                      else if (newCat === 'Abarrotes') suggestedImg = BUSINESS_IMAGE_PRESETS.supermercado;
                      else if (newCat === 'Taquería') suggestedImg = BUSINESS_IMAGE_PRESETS.tacos;
                      else if (newCat === 'Mandado / Particular') suggestedImg = BUSINESS_IMAGE_PRESETS.mandados;
                      else suggestedImg = BUSINESS_IMAGE_PRESETS.comida;

                      setForm({ ...form, categoria: newCat, imagen: suggestedImg });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Restaurante">Comida & Restaurante</option>
                    <option value="Taquería">Taquería</option>
                    <option value="Farmacia">Farmacia</option>
                    <option value="Abarrotes">Supermercado & Abarrotes</option>
                    <option value="Ferretería">Ferretería</option>
                    <option value="Mandado / Particular">Mandado Libre / Mensajería</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Zona Territorial:</label>
                  <select
                    value={form.zonaUbicacion}
                    onChange={(e) => setForm({ ...form, zonaUbicacion: e.target.value as ZonaId })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Zona 1">Zona 1: Cabecera</option>
                    <option value="Zona 2">Zona 2: Periférica</option>
                    <option value="Zona 3">Zona 3: Rancherías</option>
                    <option value="Zona 4">Zona 4: Municipios</option>
                  </select>
                </div>
              </div>

              {/* Imagen del Negocio (Foto de Platillo / Supermercado / Farmacia) */}
              <div>
                <label className="text-slate-400 uppercase font-bold block mb-1">
                  Foto de Platillo de Comida / Supermercado / Farmacia:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL de foto o platillo..."
                    value={form.imagen || ''}
                    onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs"
                  />
                  {form.imagen && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                      <img src={form.imagen} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Preajustes rápidos de fotos */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">Preajustes rápidos:</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imagen: BUSINESS_IMAGE_PRESETS.comida })}
                    className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                  >
                    🍛 Platillo Comida
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imagen: BUSINESS_IMAGE_PRESETS.pizza })}
                    className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                  >
                    🍕 Pizza
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imagen: BUSINESS_IMAGE_PRESETS.supermercado })}
                    className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                  >
                    🛒 Supermercado
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imagen: BUSINESS_IMAGE_PRESETS.farmacia })}
                    className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                  >
                    💊 Farmacia
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase font-bold block mb-1">Descripción Breve:</label>
                <input
                  type="text"
                  placeholder="Ej. Tacos al pastor y bistec preparados al momento con tortillas calientes."
                  value={form.descripcionCorta}
                  onChange={(e) => setForm({ ...form, descripcionCorta: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase font-bold block mb-1">Dirección en Coatepec:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Av. Juárez #24, Col. Centro"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Horario Apertura:</label>
                  <input
                    type="time"
                    value={form.horarioApertura}
                    onChange={(e) => setForm({ ...form, horarioApertura: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Horario Cierre:</label>
                  <input
                    type="time"
                    value={form.horarioCierre}
                    onChange={(e) => setForm({ ...form, horarioCierre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase font-bold block mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="stockFlag"
                    checked={form.requiereConfirmacionStockDefault}
                    onChange={(e) => setForm({ ...form, requiereConfirmacionStockDefault: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="stockFlag" className="text-slate-300 font-medium text-[11px]">
                    Validar stock en mostrador
                  </label>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  {editingBiz ? 'Guardar Cambios' : 'Registrar Negocio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN DEL MENÚ DEL NEGOCIO */}
      {menuModalBiz && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-xs">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400">
                    <Utensils className="w-4 h-4" />
                  </span>
                  <h3 className="font-extrabold text-white text-base">
                    Gestión del Menú: {menuModalBiz.nombre}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Agrega, modifica precios o elimina platillos y productos del catálogo del negocio.
                </p>
              </div>

              <button
                onClick={() => setMenuModalBiz(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Add item button */}
              {!isAddingMenuItem && (
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-white text-sm">
                    Platillos y Productos ({menuModalBiz.menu?.length || menuModalBiz.popularItems.length}):
                  </span>
                  <button
                    onClick={handleOpenAddMenuItem}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Nuevo Platillo</span>
                  </button>
                </div>
              )}

              {/* Add / Edit Form */}
              {isAddingMenuItem && (
                <form onSubmit={handleSaveMenuItem} className="p-4 bg-slate-950 border border-orange-500/30 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="font-bold text-orange-400">
                      {editingMenuItem ? 'Modificar Platillo / Producto' : 'Nuevo Platillo / Producto'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingMenuItem(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-slate-400 font-bold block mb-1">Nombre del Platillo / Producto:</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Tacos de Barbacoa con consomé"
                        value={menuItemForm.nombre}
                        onChange={(e) => setMenuItemForm({ ...menuItemForm, nombre: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Precio (MXN):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 font-bold">$</span>
                        <input
                          type="number"
                          required
                          min={1}
                          placeholder="50"
                          value={menuItemForm.precio}
                          onChange={(e) => setMenuItemForm({ ...menuItemForm, precio: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-6 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Categoría del Menú:</label>
                      <input
                        type="text"
                        placeholder="Ej. Tacos, Bebidas, Paquetes, Postres"
                        value={menuItemForm.categoria}
                        onChange={(e) => setMenuItemForm({ ...menuItemForm, categoria: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                      <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={menuItemForm.disponible}
                          onChange={(e) => setMenuItemForm({ ...menuItemForm, disponible: e.target.checked })}
                          className="rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span>Disponible para pedir</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Descripción de Ingredientes / Contenido:</label>
                    <input
                      type="text"
                      placeholder="Ej. Con cebolla, cilantro y tortillas recién hechas."
                      value={menuItemForm.descripcion}
                      onChange={(e) => setMenuItemForm({ ...menuItemForm, descripcion: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingMenuItem(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black cursor-pointer"
                    >
                      {editingMenuItem ? 'Guardar Cambios' : 'Agregar al Menú'}
                    </button>
                  </div>
                </form>
              )}

              {/* Items List */}
              <div className="space-y-2">
                {(menuModalBiz.menu && menuModalBiz.menu.length > 0 
                  ? menuModalBiz.menu 
                  : menuModalBiz.popularItems.map((p, i) => ({
                      id: `item-${i}`,
                      nombre: p.nombre,
                      precio: p.precioEstimado,
                      descripcion: 'Platillo registrado en el negocio',
                      categoria: 'General',
                      disponible: true
                    }))
                ).map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{item.nombre}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
                          ${item.precio} MXN
                        </span>
                        {item.categoria && (
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded">
                            {item.categoria}
                          </span>
                        )}
                        {!item.disponible && (
                          <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 font-bold">
                            Agotado
                          </span>
                        )}
                      </div>
                      {item.descripcion && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{item.descripcion}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditMenuItem(item)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                        title="Editar platillo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                        title="Eliminar del menú"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setMenuModalBiz(null)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black cursor-pointer"
              >
                Cerrar Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
