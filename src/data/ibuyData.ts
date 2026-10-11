import type { Business, Courier, Candidate, ZonaId, ZonaConfig, ServiceScheduleConfig, UserProfile } from '../types/ibuy.js';

export interface ZoneDetail {
  id: ZonaId;
  nombre: string;
  tarifaBase: number;
  rangoTarifa: string;
  tiempoEstimado: string;
  descripcion: string;
  comunidades: string[];
  color: string;
}

export const ZONAS_COATEPEC: Record<ZonaId, ZoneDetail> = {
  'Zona 1': {
    id: 'Zona 1',
    nombre: 'Centro / Cabecera Municipal',
    tarifaBase: 25,
    rangoTarifa: '$25 MXN',
    tiempoEstimado: '15-25 min',
    descripcion: 'Primer cuadro y colonias centrales de Coatepec de Harinas.',
    comunidades: [
      'Centro / Cabecera',
      'El Calvario',
      'La Palma',
      'Cruz Blanca',
      'San José',
      'El Jagüey',
      'San Juan',
      'Plaza de Toros',
      'Presidencia Municipal',
      'Barrio de Santa Ana'
    ],
    color: 'emerald'
  },
  'Zona 2': {
    id: 'Zona 2',
    nombre: 'Colonias Cercanas y Barrios Periféricos',
    tarifaBase: 40,
    rangoTarifa: '$35 - $45 MXN',
    tiempoEstimado: '25-35 min',
    descripcion: 'Barrios periféricos y accesos inmediatos a la cabecera.',
    comunidades: [
      'Zacango',
      'San Miguel',
      'Ixtlahuaca de Villada',
      'El Durazno',
      'Barrio del Panteón',
      'Primera Sección',
      'La Unión',
      'Colonia Morelos',
      'Las Lomas'
    ],
    color: 'blue'
  },
  'Zona 3': {
    id: 'Zona 3',
    nombre: 'Comunidades y Rancherías',
    tarifaBase: 60,
    rangoTarifa: '$50 - $70 MXN',
    tiempoEstimado: '35-50 min',
    descripcion: 'Comunidades rurales, caminos de terracería y rancherías del municipio.',
    comunidades: [
      'Meyuca de Morelos',
      'Tepehuajes',
      'El Salto',
      'Las Juntas',
      'Piedras Anchas',
      'Chiltepec de Hidalgo',
      'Cuentla',
      'Acuitlapilco',
      'Loma de Acuitlapilco',
      'San Luis',
      'Llano Grande',
      'Cochisquila',
      'Agua Bendita',
      'Plan de San Miguel'
    ],
    color: 'amber'
  },
  'Zona 4': {
    id: 'Zona 4',
    nombre: 'Municipios Vecinos',
    tarifaBase: 95,
    rangoTarifa: '$80 - $120 MXN',
    tiempoEstimado: '45-70 min',
    descripcion: 'Conexión logística foránea con municipios colindantes de la región sur.',
    comunidades: [
      'Ixtapan de la Sal',
      'Tonatico',
      'Villa Guerrero',
      'Almoloya de Alquisiras',
      'Zumpahuacán'
    ],
    color: 'rose'
  }
};

export const COMUNIDADES_COATEPEC_COORDS: Record<string, { lat: number; lng: number; zona: ZonaId }> = {
  'Centro / Cabecera': { lat: 18.9250, lng: -99.7680, zona: 'Zona 1' },
  'El Calvario': { lat: 18.9280, lng: -99.7650, zona: 'Zona 1' },
  'La Palma': { lat: 18.9240, lng: -99.7620, zona: 'Zona 1' },
  'Cruz Blanca': { lat: 18.9270, lng: -99.7710, zona: 'Zona 1' },
  'Zacango': { lat: 18.9180, lng: -99.7800, zona: 'Zona 2' },
  'San Miguel': { lat: 18.9150, lng: -99.7710, zona: 'Zona 2' },
  'El Durazno': { lat: 18.9120, lng: -99.7650, zona: 'Zona 2' },
  'Meyuca de Morelos': { lat: 18.9450, lng: -99.7900, zona: 'Zona 3' },
  'Tepehuajes': { lat: 18.9500, lng: -99.7500, zona: 'Zona 3' },
  'El Salto': { lat: 18.9320, lng: -99.8100, zona: 'Zona 3' },
  'Las Juntas': { lat: 18.9600, lng: -99.7700, zona: 'Zona 3' },
  'Piedras Anchas': { lat: 18.9650, lng: -99.7400, zona: 'Zona 3' },
  'Chiltepec de Hidalgo': { lat: 18.9400, lng: -99.8200, zona: 'Zona 3' },
  'Tonatico': { lat: 18.8020, lng: -99.6690, zona: 'Zona 4' },
  'Ixtapan de la Sal': { lat: 18.8440, lng: -99.6750, zona: 'Zona 4' },
  'Villa Guerrero': { lat: 18.9620, lng: -99.6420, zona: 'Zona 4' }
};

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.max(0.3, Math.round(R * c * 10) / 10);
}

export const BUSINESS_IMAGE_PRESETS = {
  comida: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=700&q=80', // Platillo de tacos y barbacoa
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80', // Platillo de pizza artesanal
  tacos: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=700&q=80', // Tacos de guisado
  farmacia: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=80', // Farmacia y medicamentos
  farmacia_similares: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=700&q=80', // Mostrador farmacia
  supermercado: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=700&q=80', // Supermercado y abarrotes
  mandados: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=700&q=80' // Mandado express
};

export function getBusinessCoverImage(b: Partial<Business>): string {
  if (b.imagen && b.imagen.trim().length > 0) return b.imagen;
  const cat = (b.categoria || '').toLowerCase();
  const name = (b.nombre || '').toLowerCase();

  if (cat.includes('farmacia') || name.includes('farmacia')) {
    return name.includes('similares') ? BUSINESS_IMAGE_PRESETS.farmacia_similares : BUSINESS_IMAGE_PRESETS.farmacia;
  }
  if (cat.includes('abarrotes') || cat.includes('supermercado') || name.includes('cremer') || name.includes('abarrot') || name.includes('tienda')) {
    return BUSINESS_IMAGE_PRESETS.supermercado;
  }
  if (name.includes('pizza')) {
    return BUSINESS_IMAGE_PRESETS.pizza;
  }
  if (name.includes('taco') || cat.includes('taquería')) {
    return BUSINESS_IMAGE_PRESETS.tacos;
  }
  if (cat.includes('mandado') || cat.includes('particular')) {
    return BUSINESS_IMAGE_PRESETS.mandados;
  }
  // Default to food dish image
  return BUSINESS_IMAGE_PRESETS.comida;
}

export const COMERCIOS_COATEPEC: Business[] = [
  {
    id: 'b-1',
    nombre: 'Barbacoa y Tacos Doña Mary',
    categoria: 'Restaurante',
    descripcionCorta: 'Barbacoa tradicional de borrego en horno de tierra, consomé y tortillas hechas a mano.',
    icono: '🌮',
    imagen: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=700&q=80',
    direccion: 'Av. Benito Juárez #42, Col. Centro, Coatepec de Harinas',
    telefono: '722-451-8920',
    horarioApertura: '08:00',
    horarioCierre: '16:00',
    es24Horas: false,
    diasOperacion: 'Miércoles a Domingo',
    requiereConfirmacionStockDefault: false,
    rating: 4.9,
    tiempoEntregaMin: '20-30 min',
    lat: 18.9252,
    lng: -99.7684,
    zonaUbicacion: 'Zona 1',
    ordenPrioridad: 1,
    popularItems: [
      { nombre: 'Taco de barbacoa de borrego', precioEstimado: 28 },
      { nombre: 'Consomé caliente con garbanzo', precioEstimado: 45 },
      { nombre: 'Kilo de barbacoa con tortillas y salsas', precioEstimado: 540 }
    ],
    menu: [
      { id: 'm1-1', nombre: 'Taco de Barbacoa de Borrego', descripcion: 'Carne suave y jugosa con cebolla, cilantro y salsa borracha.', precio: 28, categoria: 'Tacos', disponible: true },
      { id: 'm1-2', nombre: 'Consomé Caliente Especial', descripcion: 'Caldo sustancioso con garbanzo, arroz y chile chipotle.', precio: 45, categoria: 'Entradas', disponible: true },
      { id: 'm1-3', nombre: '1/2 Kilo de Barbacoa Completo', descripcion: 'Incluye 1/2 kg de carne surtida, 1/2 lt de consomé, 15 tortillas y salsas.', precio: 280, categoria: 'Paquetes', disponible: true },
      { id: 'm1-4', nombre: '1 Kilo de Barbacoa Familiar', descripcion: 'Kilo completo con 1 lt de consomé, 30 tortillas recién hechas y nopales.', precio: 540, categoria: 'Paquetes', disponible: true },
      { id: 'm1-5', nombre: 'Refresco Coca-Cola Vidrio 500ml', descripcion: 'Bien fría.', precio: 25, categoria: 'Bebidas', disponible: true }
    ],
    esPatrocinado: true,
    ofertaPatrocinada: 'Barbacoa Doña Mary: En la compra de 1/2 kg llévate un consomé mediano gratis por IBUY.'
  },
  {
    id: 'b-2',
    nombre: 'Farmacia Guadalajara Coatepec',
    categoria: 'Farmacia',
    descripcionCorta: 'Medicamentos de patente, genéricos, perfumería y artículos de primera necesidad.',
    icono: '💊',
    imagen: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=80',
    direccion: 'Plaza Hidalgo #12, Centro, Coatepec de Harinas',
    telefono: '722-198-3344',
    horarioApertura: '00:00',
    horarioCierre: '23:59',
    es24Horas: true,
    diasOperacion: 'Lunes a Domingo (24 Horas)',
    requiereConfirmacionStockDefault: true,
    rating: 4.8,
    tiempoEntregaMin: '15-25 min',
    lat: 18.9248,
    lng: -99.7678,
    zonaUbicacion: 'Zona 1',
    ordenPrioridad: 2,
    popularItems: [
      { nombre: 'Paracetamol 500mg (20 tabletas)', precioEstimado: 35 },
      { nombre: 'Amoxicilina 500mg cápsulas', precioEstimado: 85 },
      { nombre: 'Suero oral sabor uva', precioEstimado: 26 },
      { nombre: 'Pañales Etapa 4 (paquete)', precioEstimado: 195 }
    ],
    menu: [
      { id: 'm2-1', nombre: 'Amoxicilina 500mg (Caja 12 cápsulas)', descripcion: 'Antibiótico genérico. Requiere validación de stock.', precio: 85, categoria: 'Medicamentos', disponible: true, requiereStock: true },
      { id: 'm2-2', nombre: 'Paracetamol 500mg (Caja 20 tabletas)', descripcion: 'Analgésico y antipirético.', precio: 35, categoria: 'Medicamentos', disponible: true, requiereStock: true },
      { id: 'm2-3', nombre: 'Suero Electrolit Uva 625ml', descripcion: 'Solución rehidratante oral.', precio: 32, categoria: 'Cuidado y Salud', disponible: true },
      { id: 'm2-4', nombre: 'Pañales Huggies Etapa 4 (38 piezas)', descripcion: 'Paquete para bebé de 9 a 12 kg.', precio: 195, categoria: 'Bebé', disponible: true, requiereStock: true },
      { id: 'm2-5', nombre: 'Termómetro Digital Precisión', descripcion: 'Lectura rápida en 60 segundos.', precio: 75, categoria: 'Botiquín', disponible: true }
    ],
    esPatrocinado: true,
    ofertaPatrocinada: 'Farmacia Guadalajara: 15% de descuento en medicamentos genéricos y artículos de bebé hoy.'
  },
  {
    id: 'b-4',
    nombre: 'Pizzería Don Giovanni',
    categoria: 'Restaurante',
    descripcionCorta: 'Pizzas a la leña, masa crujiente, orilla rellena de queso, alitas y hamburguesas.',
    icono: '🍕',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
    direccion: 'Av. 16 de Septiembre #55, Centro',
    telefono: '722-892-4410',
    horarioApertura: '13:00',
    horarioCierre: '22:30',
    es24Horas: false,
    requiereConfirmacionStockDefault: false,
    rating: 4.95,
    tiempoEntregaMin: '25-35 min',
    lat: 18.9261,
    lng: -99.7690,
    zonaUbicacion: 'Zona 1',
    ordenPrioridad: 3,
    popularItems: [
      { nombre: 'Pizza Especial Don Giovanni Grande (Pepperoni, Champiñones, Jamón)', precioEstimado: 185 },
      { nombre: 'Pizza Hawaiana Mediana', precioEstimado: 140 },
      { nombre: 'Alitas BBQ (10 pzas)', precioEstimado: 120 }
    ],
    menu: [
      { id: 'm4-1', nombre: 'Pizza Especial Don Giovanni Grande', descripcion: 'Pepperoni de primera, jamón ahumado, champiñones frescos y pimiento.', precio: 185, categoria: 'Pizzas Grandes', disponible: true },
      { id: 'm4-2', nombre: 'Pizza Hawaiana Mediana', descripcion: 'Queso mozzarella abundante, piña en trozos y jamón.', precio: 140, categoria: 'Pizzas Medianas', disponible: true },
      { id: 'm4-3', nombre: 'Pizza Pepperoni Clásica Grande', descripcion: 'Doble porción de pepperoni horneada a la perfección.', precio: 165, categoria: 'Pizzas Grandes', disponible: true },
      { id: 'm4-4', nombre: 'Alitas Crujientes BBQ (10 piezas)', descripcion: 'Bañadas en salsa BBQ dulce con aderezo ranch.', precio: 120, categoria: 'Snacks', disponible: true },
      { id: 'm4-5', nombre: 'Refresco Coca-Cola Familiar 2L', descripcion: 'Para acompañar la pizza familiar.', precio: 45, categoria: 'Bebidas', disponible: true }
    ],
    esPatrocinado: true,
    ofertaPatrocinada: 'Pizzería Don Giovanni: Hoy 2x1 en pizzas medianas + refresco de 2L gratis al pedir por IBUY.'
  },
  {
    id: 'b-5',
    nombre: 'Abarrotes y Cremería La Central',
    categoria: 'Abarrotes',
    descripcionCorta: 'Lácteos, quesos de la región, embutidos, frutas, verduras y despensa completa.',
    icono: '🧀',
    imagen: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=700&q=80',
    direccion: 'Calle Lerdo #09, Barrio El Calvario',
    telefono: '722-334-9988',
    horarioApertura: '07:00',
    horarioCierre: '21:30',
    es24Horas: false,
    requiereConfirmacionStockDefault: true,
    rating: 4.85,
    tiempoEntregaMin: '20-30 min',
    lat: 18.9275,
    lng: -99.7655,
    zonaUbicacion: 'Zona 1',
    ordenPrioridad: 4,
    popularItems: [
      { nombre: 'Leche entera 1L', precioEstimado: 28 },
      { nombre: 'Huevo blanco (kilo)', precioEstimado: 48 },
      { nombre: 'Queso Oaxaca artesanal (1/2 kg)', precioEstimado: 75 },
      { nombre: 'Refresco Coca-Cola 3L', precioEstimado: 52 }
    ],
    menu: [
      { id: 'm5-1', nombre: 'Queso Oaxaca Fresco Artesanal (1/2 kg)', descripcion: 'Elaborado diariamente con leche de vaca entera.', precio: 75, categoria: 'Cremería', disponible: true, requiereStock: true },
      { id: 'm5-2', nombre: 'Huevo Blanco Fresco (1 Kg)', descripcion: 'Aproximadamente 16 piezas.', precio: 48, categoria: 'Despensa', disponible: true },
      { id: 'm5-3', nombre: 'Leche Lala Entera 1 Litro', descripcion: 'Tetrapack pasteurizada.', precio: 28, categoria: 'Lácteos', disponible: true },
      { id: 'm5-4', nombre: 'Jamón de Pavo Fud (1/2 kg rebanado)', descripcion: 'Rebanadas delgadas para tortas y sándwiches.', precio: 68, categoria: 'Cremería', disponible: true, requiereStock: true },
      { id: 'm5-5', nombre: 'Refresco Coca-Cola 3 Litros No Retornable', descripcion: 'Para toda la familia.', precio: 52, categoria: 'Bebidas', disponible: true }
    ]
  },
  {
    id: 'b-6',
    nombre: 'Tacos El Güero de Canasta y Guisados',
    categoria: 'Taquería',
    descripcionCorta: 'Tacos de chicharrón prensado, papa, frijol, adobo y guisados caseros.',
    icono: '🌮',
    imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=700&q=80',
    direccion: 'Frente al Kiosco Municipal, Centro',
    telefono: '722-550-1122',
    horarioApertura: '08:00',
    horarioCierre: '15:00',
    es24Horas: false,
    requiereConfirmacionStockDefault: false,
    rating: 4.75,
    tiempoEntregaMin: '15-25 min',
    lat: 18.9250,
    lng: -99.7681,
    zonaUbicacion: 'Zona 1',
    ordenPrioridad: 5,
    popularItems: [
      { nombre: 'Orden de 5 tacos de canasta surtidos', precioEstimado: 45 },
      { nombre: 'Taco de bistec con queso', precioEstimado: 22 },
      { nombre: 'Agua fresca de horchata (1L)', precioEstimado: 30 }
    ],
    menu: [
      { id: 'm6-1', nombre: 'Orden de 5 Tacos de Canasta', descripcion: 'Surtidos: Chicharrón, papa con longaniza y frijol con salsa verde.', precio: 45, categoria: 'Tacos', disponible: true },
      { id: 'm6-2', nombre: 'Orden de 10 Tacos de Canasta', descripcion: 'Ideal para compartir, con cebollitas y chiles en vinagre.', precio: 85, categoria: 'Tacos', disponible: true },
      { id: 'm6-3', nombre: 'Agua de Horchata Casera 1 Litro', descripcion: 'Con toque de canela fresca.', precio: 30, categoria: 'Bebidas', disponible: true }
    ]
  },
  {
    id: 'b-3',
    nombre: 'Farmacias Similares Centro',
    categoria: 'Farmacia',
    descripcionCorta: 'Medicamentos genéricos de calidad, vitaminas y suplementos al mejor precio.',
    icono: '🏥',
    imagen: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=700&q=80',
    direccion: 'Calle Morelos #18, Cabecera Municipal',
    telefono: '722-670-2211',
    horarioApertura: '08:00',
    horarioCierre: '22:00',
    es24Horas: false,
    requiereConfirmacionStockDefault: true,
    rating: 4.6,
    tiempoEntregaMin: '15-20 min',
    lat: 18.9242,
    lng: -99.7670,
    zonaUbicacion: 'Zona 1',
    ordenPrioridad: 6,
    popularItems: [
      { nombre: 'Loratadina 10mg', precioEstimado: 25 },
      { nombre: 'Omeprazol 20mg', precioEstimado: 38 },
      { nombre: 'Jarabe para la tos', precioEstimado: 60 }
    ],
    menu: [
      { id: 'm3-1', nombre: 'Loratadina 10mg (10 tabs)', descripcion: 'Antihistamínico para alergias.', precio: 25, categoria: 'Genéricos', disponible: true, requiereStock: true },
      { id: 'm3-2', nombre: 'Omeprazol 20mg (14 cápsulas)', descripcion: 'Para acidez estomacal y reflujo.', precio: 38, categoria: 'Genéricos', disponible: true, requiereStock: true },
      { id: 'm3-3', nombre: 'Jarabe Ambroxol 120ml', descripcion: 'Expectorante para tos con flema.', precio: 48, categoria: 'Genéricos', disponible: true, requiereStock: true }
    ]
  },
  {
    id: 'b-9',
    nombre: 'Mandados & Envíos Express IBUY',
    categoria: 'Mandado / Particular',
    descripcionCorta: 'Mandados libres, compras en OXXO, tortillerías, pagos de servicios o paquetería express.',
    icono: '🛵',
    imagen: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=700&q=80',
    direccion: 'Cualquier punto de Coatepec de Harinas y alrededores',
    telefono: '722-800-IBUY',
    horarioApertura: '07:00',
    horarioCierre: '23:00',
    es24Horas: false,
    requiereConfirmacionStockDefault: false,
    rating: 5.0,
    tiempoEntregaMin: '25-40 min',
    lat: 18.9248,
    lng: -99.7680,
    zonaUbicacion: 'Zona 1',
    ordenPrioridad: 7,
    popularItems: [
      { nombre: 'Mandado libre en tienda/OXXO', precioEstimado: 50 },
      { nombre: 'Recolección y entrega de paquete express', precioEstimado: 45 },
      { nombre: 'Trámite o pago de recibos en ventanilla', precioEstimado: 40 }
    ],
    menu: [
      { id: 'm9-1', nombre: 'Mandado Express (Compras en OXXO / Tienda)', descripcion: 'Escribe lo que necesitas y el repartidor lo compra.', precio: 45, categoria: 'Servicios', disponible: true },
      { id: 'm9-2', nombre: 'Entrega de Paquete / Llaves / Documentos', descripcion: 'Recogemos en punto A y entregamos en punto B con confirmación de firma.', precio: 50, categoria: 'Envíos', disponible: true }
    ]
  }
];

export const PATROCINIOS_DESTACADOS = [
  {
    negocio: 'Pizzería Don Giovanni',
    mensaje: 'Hoy 2x1 en pizzas medianas + refresco de 2L gratis al ordenar por IBUY.',
    imagen: '🍕',
    descuento: '2x1 Especial',
    valido: 'Solo hoy por IBUY'
  },
  {
    negocio: 'Farmacia Guadalajara Coatepec',
    mensaje: '15% de descuento en medicamentos genéricos y artículos de bebé hoy.',
    imagen: '💊',
    descuento: '15% OFF',
    valido: 'En sucursal Centro'
  },
  {
    negocio: 'Barbacoa y Tacos Doña Mary',
    mensaje: 'En la compra de 1/2 kg llévate un consomé mediano gratis pidiendo por IBUY.',
    imagen: '🌮',
    descuento: 'Consomé Gratis',
    valido: 'Horno de tierra tradicional'
  },
  {
    negocio: 'Pollo Feliz Coatepec',
    mensaje: 'En la compra de tu paquete familiar recibe medio kilo de papas y refresco gratis.',
    imagen: '🍗',
    descuento: 'Combo Familiar',
    valido: 'Envío prioritario'
  },
  {
    negocio: 'Carnicería La Fama de Coatepec',
    mensaje: 'Arrachera marinada premium con tortillas calientes y envío express directo a tu puerta.',
    imagen: '🥩',
    descuento: 'Calidad Premium',
    valido: 'Cortes frescos del día'
  }
];

export const REPARTIDORES_INICIALES: Courier[] = [
  {
    id: 'rep-1',
    nombre: 'Luis Alberto Mendoza',
    telefono: '722-349-1102',
    vehiculo: 'Moto',
    modeloVehiculo: 'Italika FT150 Roja',
    placas: 'M98-KLA',
    estado: 'DISPONIBLE',
    pedidosCompletados: 482,
    calificacion: 4.9,
    zonaPreferente: 'Zona 1',
    lat: 18.9255,
    lng: -99.7675,
    ubicacionActual: 'Kiosco Central, Coatepec',
    pinAcceso: '1234'
  },
  {
    id: 'rep-2',
    nombre: 'Javier Morales Estrada',
    telefono: '722-512-8874',
    vehiculo: 'Moto',
    modeloVehiculo: 'Honda Cargo 150 Blanca',
    placas: 'E45-TRX',
    estado: 'EN_REPARTO',
    pedidosCompletados: 615,
    calificacion: 5.0,
    zonaPreferente: 'Zona 3',
    lat: 18.9380,
    lng: -99.7790,
    ubicacionActual: 'Camino a Meyuca de Morelos',
    pinAcceso: '1234'
  },
  {
    id: 'rep-3',
    nombre: 'Mateo Gómez Bernal',
    telefono: '722-990-4412',
    vehiculo: 'Moto',
    modeloVehiculo: 'Bajaj Pulsar NS200 Negra',
    placas: 'P12-MNB',
    estado: 'DISPONIBLE',
    pedidosCompletados: 310,
    calificacion: 4.8,
    zonaPreferente: 'Zona 4',
    lat: 18.8800,
    lng: -99.7200,
    ubicacionActual: 'Carretera Coatepec - Ixtapan',
    pinAcceso: '1234'
  },
  {
    id: 'rep-4',
    nombre: 'Sofía Rivas Peña',
    telefono: '722-814-7733',
    vehiculo: 'Moto',
    modeloVehiculo: 'Vento Ryder 150 Azul',
    placas: 'V33-QWE',
    estado: 'DISPONIBLE',
    pedidosCompletados: 198,
    calificacion: 4.9,
    zonaPreferente: 'Zona 2',
    lat: 18.9210,
    lng: -99.7740,
    ubicacionActual: 'Entrada a Zacango',
    pinAcceso: '1234'
  },
  {
    id: 'rep-5',
    nombre: 'Raúl Domínguez Cruz',
    telefono: '722-601-3329',
    vehiculo: 'Auto',
    modeloVehiculo: 'Nissan March Gris (Envíos grandes)',
    placas: 'NEZ-7821',
    estado: 'DISPONIBLE',
    pedidosCompletados: 240,
    calificacion: 4.95,
    zonaPreferente: 'Zona 4',
    lat: 18.9240,
    lng: -99.7690,
    ubicacionActual: 'Base de Taxis Centro',
    pinAcceso: '1234'
  }
];

export const CANDIDATOS_INICIALES: Candidate[] = [
  {
    id: 'cand-1',
    nombre: 'Carlos Daniel Pérez',
    telefono: '722-488-9901',
    vehiculo: 'Moto Italika 150',
    fechaSolicitud: 'Hoy, 14:20 hrs',
    estado: 'NUEVO',
    mensajeOriginal: 'Hola buenas tardes quiero trabajar de repartidor en IBUY tengo moto italika 150 papeles en regla soy de Tepehuajes'
  },
  {
    id: 'cand-2',
    nombre: 'Eduardo Nava Soto',
    telefono: '722-311-5520',
    vehiculo: 'Moto Honda Wave 110',
    fechaSolicitud: 'Hoy, 11:45 hrs',
    estado: 'CONTACTADO',
    mensajeOriginal: 'Busco chamba de repartidor en moto, conozco bien Meyuca, Zacango y el centro de Coatepec'
  }
];

export const DEFAULT_ZONAS_CONFIG: ZonaConfig[] = [
  {
    id: 'Zona 1',
    nombre: 'Centro / Cabecera Municipal',
    tarifaEnvio: 25,
    tiempoEstimadoMinutos: '15-25 min',
    descripcion: 'Primer cuadro y colonias centrales de Coatepec de Harinas.',
    color: 'emerald',
    activa: true,
    comunidades: [
      'Centro / Cabecera',
      'El Calvario',
      'La Palma',
      'Cruz Blanca',
      'San José',
      'El Jagüey',
      'San Juan',
      'Plaza de Toros',
      'Presidencia Municipal',
      'Barrio de Santa Ana'
    ]
  },
  {
    id: 'Zona 2',
    nombre: 'Colonias Cercanas y Barrios Periféricos',
    tarifaEnvio: 40,
    tiempoEstimadoMinutos: '25-35 min',
    descripcion: 'Barrios periféricos y accesos inmediatos a la cabecera.',
    color: 'blue',
    activa: true,
    comunidades: [
      'Zacango',
      'San Miguel',
      'Ixtlahuaca de Villada',
      'El Durazno',
      'Barrio del Panteón',
      'Primera Sección',
      'La Unión',
      'Colonia Morelos',
      'Las Lomas'
    ]
  },
  {
    id: 'Zona 3',
    nombre: 'Comunidades y Rancherías',
    tarifaEnvio: 60,
    tiempoEstimadoMinutos: '35-50 min',
    descripcion: 'Comunidades rurales, caminos de terracería y rancherías del municipio.',
    color: 'amber',
    activa: true,
    comunidades: [
      'Meyuca de Morelos',
      'Tepehuajes',
      'El Salto',
      'Las Juntas',
      'Piedras Anchas',
      'Chiltepec de Hidalgo',
      'Cuentla',
      'Acuitlapilco',
      'Loma de Acuitlapilco',
      'San Luis',
      'Llano Grande',
      'Cochisquila',
      'Agua Bendita',
      'Plan de San Miguel'
    ]
  },
  {
    id: 'Zona 4',
    nombre: 'Municipios Vecinos',
    tarifaEnvio: 95,
    tiempoEstimadoMinutos: '45-70 min',
    descripcion: 'Conexión logística foránea con municipios colindantes de la región sur.',
    color: 'rose',
    activa: true,
    comunidades: [
      'Ixtapan de la Sal',
      'Tonatico',
      'Villa Guerrero',
      'Almoloya de Alquisiras',
      'Zumpahuacán'
    ]
  }
];

export const DEFAULT_SERVICE_SCHEDULE: ServiceScheduleConfig = {
  servicioActivo: true,
  horarioApertura: '08:00',
  horarioCierre: '22:00',
  diasOperacion: 'Lunes a Domingo',
  mensajeFueraDeHorario: 'El servicio de repartos IBUY se encuentra fuera de horario de operación. Nuestro horario es de 08:00 a 22:00 hrs.',
  adminWhatsApp: '722 450 1100'
};

export const USUARIOS_REGISTRADOS_INICIALES: UserProfile[] = [
  {
    id: 'usr-1',
    role: 'cliente',
    nombre: 'María Gómez',
    telefono: '722 450 1122',
    pin: '1234',
    comunidadUbicacion: 'Meyuca de Morelos',
    zonaUbicacion: 'Zona 3',
    fechaRegistro: '2026-09-15'
  },
  {
    id: 'usr-2',
    role: 'cliente',
    nombre: 'Lic. Fernando Cruz',
    telefono: '722 899 3321',
    pin: '1234',
    comunidadUbicacion: 'El Calvario',
    zonaUbicacion: 'Zona 1',
    fechaRegistro: '2026-09-20'
  },
  {
    id: 'usr-3',
    role: 'cliente',
    nombre: 'Alejandro Morales',
    telefono: '722 344 8812',
    pin: '1234',
    comunidadUbicacion: 'Zacango',
    zonaUbicacion: 'Zona 2',
    fechaRegistro: '2026-09-28'
  }
];

