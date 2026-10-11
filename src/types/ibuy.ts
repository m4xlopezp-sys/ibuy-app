export type AccionDetectada = 'CREAR_PEDIDO' | 'CONSULTAR_HORARIO' | 'RECLUTAMIENTO' | 'SEGUIMIENTO';

export type ZonaId = 'Zona 1' | 'Zona 2' | 'Zona 3' | 'Zona 4';

export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Tarjeta';

export type UserRole = 'cliente' | 'administrador' | 'repartidor';

export interface UserSession {
  role: UserRole;
  nombre: string;
  identificador: string;
  courierId?: string;
  comunidadUbicacion?: string;
  zonaUbicacion?: ZonaId;
}

export interface ClienteData {
  nombre: string | null;
  telefono?: string | null;
  direccion_entrega: string;
  referencia_domicilio?: string | null;
  zona: ZonaId;
}

export interface ItemPedido {
  producto: string;
  cantidad: number;
  precioUnitario?: number;
  notas: string | null;
}

export interface PedidoData {
  establecimiento: string;
  items: ItemPedido[];
  subtotal_estimado: number;
  costo_envio: number;
  total_estimado: number;
  metodo_pago: MetodoPago;
  cambio_para: number;
}

export interface LogisticaData {
  requiere_confirmacion_stock: boolean;
  tiempo_estimado_entrega_minutos: string;
  mensaje_estado: string;
}

export interface PromocionPatrocinada {
  mostrar: boolean;
  negocio: string;
  mensaje: string;
}

export interface DatosReclutamiento {
  es_solicitud: boolean;
  nombre_candidato: string | null;
  telefono: string | null;
  vehiculo: string | null;
}

/**
 * Strict JSON output required by the user prompt
 */
export interface IbuyOutput {
  accion_detectada: AccionDetectada;
  cliente: ClienteData;
  pedido: PedidoData;
  logistica: LogisticaData;
  promocion_patrocinada: PromocionPatrocinada;
  datos_reclutamiento: DatosReclutamiento;
}

export type OrderStatus = 
  | 'PENDIENTE' 
  | 'VALIDANDO_STOCK' 
  | 'ASIGNADO' 
  | 'LLEGUE_AL_NEGOCIO' 
  | 'ESPERANDO_PEDIDO' 
  | 'EN_CAMINO' 
  | 'EN_RUTA' 
  | 'LLEGUE_AL_DOMICILIO' 
  | 'ENTREGADO' 
  | 'CANCELADO';

export interface OrderMessage {
  id: string;
  remitente: 'repartidor' | 'cliente' | 'sistema';
  texto: string;
  timestamp: string;
}

export interface CalificacionPedido {
  estrellasRepartidor: number; // 1-5
  comentarioRepartidor?: string;
  estrellasNegocio: number; // 1-5
  comentarioNegocio?: string;
  fechaCalificacion: string;
}

export interface DispatchedOrder {
  id: string;
  createdAt: string;
  updatedAt?: string;
  data: IbuyOutput;
  status: OrderStatus;
  codigoEntregaCliente: string; // 4-digit code required to finish delivery
  repartidorAsignado?: string;
  repartidorTelefono?: string;
  repartidorVehiculo?: string;
  repartidorPlacas?: string;
  repartidorFoto?: string;
  repartidorLat?: number;
  repartidorLng?: number;
  repartidorUbicacionNombre?: string;
  notasInternas?: string;
  trackingStep?: number;
  tipoPedido?: 'tienda' | 'mandado_personalizado' | 'mandado_complejo';
  mensajesRepartidor?: OrderMessage[];
  calificacion?: CalificacionPedido;
  detallesMandadoComplejo?: {
    puntoRecogida: string;
    puntoEntrega: string;
    instruccionesEspeciales: string;
    presupuestoMaximo?: number;
  };
}

export interface ProductItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  requiereStock?: boolean;
}

export interface Business {
  id: string;
  nombre: string;
  categoria: 'Restaurante' | 'Farmacia' | 'Abarrotes' | 'Ferretería' | 'Taquería' | 'Panadería / Postres' | 'Mandado / Particular';
  descripcionCorta?: string;
  imagen?: string;
  icono?: string;
  direccion: string;
  telefono: string;
  horarioApertura: string;
  horarioCierre: string;
  es24Horas?: boolean;
  diasOperacion?: string;
  requiereConfirmacionStockDefault: boolean;
  rating?: number;
  tiempoEntregaMin?: string;
  popularItems: { nombre: string; precioEstimado: number }[];
  menu?: ProductItem[];
  esPatrocinado?: boolean;
  ofertaPatrocinada?: string;
  lat: number;
  lng: number;
  zonaUbicacion: ZonaId;
  ordenPrioridad?: number;
  activo?: boolean;
}

export interface Courier {
  id: string;
  nombre: string;
  telefono: string;
  vehiculo: 'Moto' | 'Auto' | 'Bici';
  modeloVehiculo: string;
  placas?: string;
  estado: 'DISPONIBLE' | 'EN_REPARTO' | 'DESCONECTADO';
  pedidosCompletados: number;
  calificacion: number;
  zonaPreferente: ZonaId;
  foto?: string;
  lat: number;
  lng: number;
  ubicacionActual: string;
  pinAcceso?: string;
  corteDelDia?: {
    totalPedidos: number;
    totalEfectivo: number;
    totalGananciasTarifas: number;
    horaCierre: string;
    cerrado: boolean;
  };
}

export interface Candidate {
  id: string;
  nombre: string;
  telefono: string;
  vehiculo: string;
  fechaSolicitud: string;
  estado: 'NUEVO' | 'CONTACTADO' | 'EN_CAPACITACION' | 'APROBADO' | 'DESCARTADO';
  mensajeOriginal: string;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  nombre: string;
  telefono: string; // WhatsApp
  pin: string;
  comunidadUbicacion: string;
  zonaUbicacion: ZonaId;
  fechaRegistro: string;
}

export interface ZonaConfig {
  id: string; // e.g., 'Zona 1', 'Zona 2', 'Zona 5'
  nombre: string; // e.g. "Centro / Cabecera Municipal"
  tarifaEnvio: number; // e.g. 25
  tiempoEstimadoMinutos: string; // e.g. "15-25 min"
  comunidades: string[]; // e.g. ["Centro", "El Calvario"]
  descripcion: string;
  color?: string; // e.g. "emerald", "blue", "amber", "purple", "rose"
  activa: boolean;
}

export interface ServiceScheduleConfig {
  servicioActivo: boolean;
  horarioApertura: string; // e.g. "08:00"
  horarioCierre: string;   // e.g. "22:00"
  diasOperacion: string;   // e.g. "Lunes a Domingo"
  mensajeFueraDeHorario?: string;
  adminWhatsApp: string;   // e.g. "722 450 1100"
}

export interface WhatsAppNotification {
  id: string;
  destinatario: 'cliente' | 'repartidor' | 'administrador';
  destinatarioNombre: string;
  telefono: string;
  mensaje: string;
  timestamp: string;
  tipo: 'NUEVO_PEDIDO' | 'CAMBIO_ESTATUS' | 'CIERRE_DIA' | 'CALIFICACION';
  orderId?: string;
  leido?: boolean;
}
