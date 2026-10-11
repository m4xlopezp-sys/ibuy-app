import React, { useState, useEffect } from 'react';
import { Navbar, RoleView } from './components/Navbar';
import { ClientApp } from './components/ClientApp';
import { DispatchCenter } from './components/DispatchCenter';
import { DriverApp } from './components/DriverApp';
import { BusinessManager } from './components/BusinessManager';
import { WhatsAppAssistantConsole } from './components/WhatsAppAssistantConsole';
import { ZonesAndCoverageMap } from './components/ZonesAndCoverageMap';
import { AuthModal } from './components/AuthModal';
import { AdminZonesManager } from './components/AdminZonesManager';
import { AdminCouriersManager } from './components/AdminCouriersManager';
import { WhatsAppNotificationCenter } from './components/WhatsAppNotificationCenter';
import { 
  IbuyOutput, 
  DispatchedOrder, 
  OrderStatus, 
  Courier, 
  Candidate, 
  UserSession, 
  ZonaId, 
  Business,
  ZonaConfig,
  ServiceScheduleConfig,
  UserProfile,
  CalificacionPedido,
  WhatsAppNotification
} from './types/ibuy';
import { 
  REPARTIDORES_INICIALES, 
  CANDIDATOS_INICIALES, 
  COMERCIOS_COATEPEC,
  DEFAULT_ZONAS_CONFIG,
  DEFAULT_SERVICE_SCHEDULE,
  USUARIOS_REGISTRADOS_INICIALES
} from './data/ibuyData';
import { processIbuyMessageLocally } from './utils/nlpEngine';
import { Lock, Bike, Settings, Compass, MessageSquare } from 'lucide-react';

export default function App() {
  // Current user session (Customer María Gómez by default)
  const [currentSession, setCurrentSession] = useState<UserSession>({
    role: 'cliente',
    nombre: 'María Gómez',
    identificador: '722 450 1122',
    comunidadUbicacion: 'Meyuca de Morelos',
    zonaUbicacion: 'Zona 3'
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<RoleView>('client');
  const [simulatedTime, setSimulatedTime] = useState<string>('14:30');

  // Dynamic Zones (Admin configurable: add, edit, remove, shipping cost)
  const [zones, setZones] = useState<ZonaConfig[]>(DEFAULT_ZONAS_CONFIG);

  // General Service Schedule (Admin configurable: opening, closing, active toggle, admin WhatsApp)
  const [serviceSchedule, setServiceSchedule] = useState<ServiceScheduleConfig>(DEFAULT_SERVICE_SCHEDULE);

  // Registered Customer and Driver Users
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(USUARIOS_REGISTRADOS_INICIALES);
  
  // Businesses dynamic state: editable and reorderable by administrator
  const [businesses, setBusinesses] = useState<Business[]>(COMERCIOS_COATEPEC);
  
  // Couriers list (can be added by administrator)
  const [couriers, setCouriers] = useState<Courier[]>(REPARTIDORES_INICIALES);
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATOS_INICIALES);
  const [isAiConnected, setIsAiConnected] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingSource, setProcessingSource] = useState<string>('Motor Lógico IBUY');

  // WhatsApp Notifications Log and Center
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([
    {
      id: 'notif-init-1',
      destinatario: 'cliente',
      destinatarioNombre: 'María Gómez',
      telefono: '722 450 1122',
      mensaje: '🛵 ¡Hola María! Tu pedido #ORD-8821 de Barbacoa Doña Mary va en camino hacia Meyuca de Morelos (Zona 3). Tu repartidor Toño Velázquez llegará en aprox. 20 min.',
      timestamp: '14:24',
      tipo: 'CAMBIO_ESTATUS',
      orderId: 'ORD-8821',
      leido: false
    },
    {
      id: 'notif-init-2',
      destinatario: 'repartidor',
      destinatarioNombre: 'Toño Velázquez',
      telefono: '722-441-2098',
      mensaje: '🔔 ¡Nuevo pedido asignado #ORD-8821!\nRecoger en: Barbacoa Doña Mary\nEntregar a: María Gómez en Meyuca de Morelos (Zona 3)\nTotal a cobrar: $189 MXN (Efectivo)\nTarifa de envío para ti: $60 MXN.',
      timestamp: '14:20',
      tipo: 'NUEVO_PEDIDO',
      orderId: 'ORD-8821',
      leido: false
    }
  ]);
  const [isWhatsAppCenterOpen, setIsWhatsAppCenterOpen] = useState<boolean>(false);

  // Helper to add WhatsApp notifications
  const addWhatsAppNotification = (notif: Omit<WhatsAppNotification, 'id' | 'timestamp' | 'leido'>) => {
    const newN: WhatsAppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leido: false,
      ...notif
    };
    setNotifications((prev) => [newN, ...prev]);
  };

  // Initial live orders with 4-digit customer delivery codes
  const [orders, setOrders] = useState<DispatchedOrder[]>([
    {
      id: 'ORD-8821',
      createdAt: 'Hace 8 min',
      status: 'EN_CAMINO',
      codigoEntregaCliente: '4821',
      repartidorAsignado: 'Toño Velázquez Morales',
      repartidorTelefono: '722-441-2098',
      repartidorVehiculo: 'Yamaha YBR 125 Azul',
      repartidorPlacas: 'T56-ZZA',
      mensajesRepartidor: [
        {
          id: 'msg-1',
          remitente: 'repartidor',
          texto: 'Hola María, ya recogí tus tacos calientes. Voy en camino hacia Meyuca.',
          timestamp: '14:24'
        }
      ],
      data: {
        accion_detectada: 'CREAR_PEDIDO',
        cliente: {
          nombre: 'María Gómez',
          telefono: '722 450 1122',
          direccion_entrega: 'Meyuca de Morelos (Entrada principal junto a la iglesia)',
          zona: 'Zona 3'
        },
        pedido: {
          establecimiento: 'Barbacoa y Tacos Doña Mary',
          items: [
            { producto: 'Taco de barbacoa de borrego', cantidad: 3, notas: 'Con cebolla y cilantro' },
            { producto: 'Consomé caliente con garbanzo', cantidad: 1, notas: null }
          ],
          subtotal_estimado: 129.0,
          costo_envio: 60.0,
          total_estimado: 189.0,
          metodo_pago: 'Efectivo',
          cambio_para: 200.0
        },
        logistica: {
          requiere_confirmacion_stock: false,
          tiempo_estimado_entrega_minutos: '20-30',
          mensaje_estado: 'Tu repartidor Toño Velázquez va en trayecto rumbo a Meyuca de Morelos (Zona 3). Tarifa de envío: $60 MXN.'
        },
        promocion_patrocinada: {
          mostrar: true,
          negocio: 'Pizzería Don Giovanni',
          mensaje: 'Hoy 2x1 en pizzas medianas + refresco de 2L gratis al pedir por IBUY.'
        },
        datos_reclutamiento: {
          es_solicitud: false,
          nombre_candidato: null,
          telefono: null,
          vehiculo: null
        }
      }
    },
    {
      id: 'ORD-8822',
      createdAt: 'Hace 3 min',
      status: 'ASIGNADO',
      codigoEntregaCliente: '7193',
      repartidorAsignado: 'Luis Alberto Mendoza',
      repartidorTelefono: '722-349-1102',
      repartidorVehiculo: 'Italika FT150 Roja',
      repartidorPlacas: 'M98-KLA',
      data: {
        accion_detectada: 'CREAR_PEDIDO',
        cliente: {
          nombre: 'Lic. Fernando Cruz',
          telefono: '722 899 3321',
          direccion_entrega: 'Calle Juárez #24, Barrio El Calvario',
          zona: 'Zona 1'
        },
        pedido: {
          establecimiento: 'Farmacia Guadalajara Coatepec',
          items: [
            { producto: 'Amoxicilina 500mg cápsulas', cantidad: 1, notas: 'Caja con 12' },
            { producto: 'Suero oral sabor uva', cantidad: 2, notas: null }
          ],
          subtotal_estimado: 137.0,
          costo_envio: 25.0,
          total_estimado: 162.0,
          metodo_pago: 'Efectivo',
          cambio_para: 200.0
        },
        logistica: {
          requiere_confirmacion_stock: false,
          tiempo_estimado_entrega_minutos: '15-25',
          mensaje_estado: 'Pedido asignado. Repartidor Luis Alberto Mendoza en camino a Farmacia Guadalajara Coatepec.'
        },
        promocion_patrocinada: {
          mostrar: true,
          negocio: 'Barbacoa y Tacos Doña Mary',
          mensaje: 'En la compra de 1/2 kg llévate un consomé mediano gratis pidiendo por IBUY.'
        },
        datos_reclutamiento: {
          es_solicitud: false,
          nombre_candidato: null,
          telefono: null,
          vehiculo: null
        }
      }
    }
  ]);

  const [lastProcessedOutput, setLastProcessedOutput] = useState<IbuyOutput | null>(
    orders[0].data
  );

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setIsAiConnected(true);
        }
      })
      .catch((_) => {
        setIsAiConnected(false);
      });
  }, []);

  const handleProcessMessage = async (message: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, simulatedTime }),
      });

      if (!response.ok) {
        throw new Error('API server error');
      }

      const data = await response.json();
      const output: IbuyOutput = data.output;
      setProcessingSource(data.source || 'gemini-3.8-flash');
      setLastProcessedOutput(output);

      if (output.accion_detectada === 'RECLUTAMIENTO' && output.datos_reclutamiento.es_solicitud) {
        const newCandidate: Candidate = {
          id: `cand-${Date.now()}`,
          nombre: output.datos_reclutamiento.nombre_candidato || 'Aspirante Interesado',
          telefono: output.datos_reclutamiento.telefono || 'Sin teléfono',
          vehiculo: output.datos_reclutamiento.vehiculo || 'Moto',
          fechaSolicitud: 'Hoy, hace un momento',
          estado: 'NUEVO',
          mensajeOriginal: message
        };
        setCandidates((prev) => [newCandidate, ...prev]);
      }

      return { source: data.source, output };
    } catch (err) {
      console.warn('Network API error, using deterministic local engine:', err);
      const local = processIbuyMessageLocally(message, { simulatedTime });
      setProcessingSource('ibuy-local-engine');
      setLastProcessedOutput(local);

      if (local.accion_detectada === 'RECLUTAMIENTO' && local.datos_reclutamiento.es_solicitud) {
        const newCandidate: Candidate = {
          id: `cand-${Date.now()}`,
          nombre: local.datos_reclutamiento.nombre_candidato || 'Aspirante Interesado',
          telefono: local.datos_reclutamiento.telefono || 'Sin teléfono',
          vehiculo: local.datos_reclutamiento.vehiculo || 'Moto',
          fechaSolicitud: 'Hoy, hace un momento',
          estado: 'NUEVO',
          mensajeOriginal: message
        };
        setCandidates((prev) => [newCandidate, ...prev]);
      }

      return { source: 'ibuy-local-engine', output: local };
    } finally {
      setIsProcessing(false);
    }
  };

  // Place Order Handler (User Request: WhatsApp message to client and to driver on new order)
  const handlePlaceOrder = (newOrder: DispatchedOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    
    if (newOrder.repartidorAsignado) {
      setCouriers((prev) =>
        prev.map(c => c.nombre === newOrder.repartidorAsignado ? { ...c, estado: 'EN_REPARTO' } : c)
      );
    }

    // 1. WhatsApp Notification to Client
    const clientPhone = newOrder.data.cliente.telefono || '722 450 1122';
    const clientName = newOrder.data.cliente.nombre || 'Cliente IBUY';
    addWhatsAppNotification({
      destinatario: 'cliente',
      destinatarioNombre: clientName,
      telefono: clientPhone,
      mensaje: `🛍️ ¡Hola ${clientName}! Tu orden #${newOrder.id} ha sido registrada con éxito.\nNegocio: ${newOrder.data.pedido.establecimiento}\nTotal: $${newOrder.data.pedido.total_estimado} MXN\nCosto de envío (${newOrder.data.cliente.zona}): $${newOrder.data.pedido.costo_envio} MXN\nRepartidor asignado: ${newOrder.repartidorAsignado || 'Luis Alberto Mendoza'}\n🔐 Tu código secreto de entrega (4 dígitos): #${newOrder.codigoEntregaCliente}\nSigue tu pedido en vivo por el mapa web de IBUY.`,
      tipo: 'NUEVO_PEDIDO',
      orderId: newOrder.id
    });

    // 2. WhatsApp Notification to Assigned Driver
    if (newOrder.repartidorAsignado) {
      const driverPhone = newOrder.repartidorTelefono || '722-349-1102';
      addWhatsAppNotification({
        destinatario: 'repartidor',
        destinatarioNombre: newOrder.repartidorAsignado,
        telefono: driverPhone,
        mensaje: `🔔 ¡Nuevo Pedido Asignado #${newOrder.id}!\nRecoger en: ${newOrder.data.pedido.establecimiento} (Centro)\nEntregar a: ${clientName} en ${newOrder.data.cliente.direccion_entrega} (${newOrder.data.cliente.zona})\nTotal a cobrar: $${newOrder.data.pedido.total_estimado} MXN (${newOrder.data.pedido.metodo_pago})\nTarifa de entrega para ti: $${newOrder.data.pedido.costo_envio} MXN.\nRecuerda solicitar el código de 4 dígitos al entregar.`,
        tipo: 'NUEVO_PEDIDO',
        orderId: newOrder.id
      });
    }
  };

  const handleDispatchFromAssistant = (output: IbuyOutput) => {
    const availableCouriers = couriers.filter(c => c.estado === 'DISPONIBLE');
    const assigned = availableCouriers.length > 0 ? availableCouriers[0] : couriers[0];
    const newOrder: DispatchedOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Justo ahora (WhatsApp)',
      codigoEntregaCliente: String(Math.floor(1000 + Math.random() * 9000)),
      data: output,
      status: 'ASIGNADO',
      repartidorAsignado: assigned.nombre,
      repartidorTelefono: assigned.telefono,
      repartidorVehiculo: assigned.modeloVehiculo,
      repartidorPlacas: assigned.placas || ''
    };
    handlePlaceOrder(newOrder);
  };

  // Update Status Handler (User Request: WhatsApp message to client on every driver status change)
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    let targetOrder: DispatchedOrder | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          targetOrder = ord;
          const updated = { ...ord, status: newStatus };
          if (newStatus === 'ENTREGADO') {
            updated.data.logistica.mensaje_estado = '¡Tu pedido ha sido entregado exitosamente por tu repartidor de IBUY!';
          } else if (newStatus === 'LLEGUE_AL_DOMICILIO') {
            updated.data.logistica.mensaje_estado = `El repartidor ${ord.repartidorAsignado || ''} ha llegado a tu domicilio y te espera afuera.`;
          } else if (newStatus === 'EN_CAMINO' || newStatus === 'EN_RUTA') {
            updated.data.logistica.mensaje_estado = `El repartidor ${ord.repartidorAsignado || ''} va en camino a tu domicilio en su moto.`;
          } else if (newStatus === 'ESPERANDO_PEDIDO') {
            updated.data.logistica.mensaje_estado = `El repartidor está en mostrador esperando la preparación de tu orden.`;
          } else if (newStatus === 'LLEGUE_AL_NEGOCIO') {
            updated.data.logistica.mensaje_estado = `El repartidor llegó a ${ord.data.pedido.establecimiento} para recoger tu pedido.`;
          }
          return updated;
        }
        return ord;
      })
    );

    // Send WhatsApp notification to Client on status change
    const orderData = targetOrder || orders.find(o => o.id === orderId);
    if (orderData) {
      const clientName = orderData.data.cliente.nombre || 'Cliente';
      const clientPhone = orderData.data.cliente.telefono || '722 450 1122';
      const driverName = orderData.repartidorAsignado || 'Tu repartidor';

      let statusMsg = '';
      if (newStatus === 'LLEGUE_AL_NEGOCIO') {
        statusMsg = `🛵 Actualización orden #${orderId}: ${driverName} ya llegó al establecimiento "${orderData.data.pedido.establecimiento}" y está solicitando tu pedido.`;
      } else if (newStatus === 'ESPERANDO_PEDIDO') {
        statusMsg = `📦 Actualización orden #${orderId}: ${driverName} está en mostrador esperando el empaque final de tus productos.`;
      } else if (newStatus === 'EN_CAMINO' || newStatus === 'EN_RUTA') {
        statusMsg = `🚀 ¡Tu orden #${orderId} va en camino! ${driverName} va en trayecto en moto rumbo a ${orderData.data.cliente.direccion_entrega} (${orderData.data.cliente.zona}).`;
      } else if (newStatus === 'LLEGUE_AL_DOMICILIO') {
        statusMsg = `🔔 ¡${driverName} ya está afuera de tu domicilio! Por favor ten a la mano tu código secreto de 4 dígitos: #${orderData.codigoEntregaCliente}.`;
      } else if (newStatus === 'ENTREGADO') {
        statusMsg = `🎉 ¡Tu pedido #${orderId} ha sido entregado exitosamente! Código validado. Ya puedes calificar con estrellas al repartidor y al establecimiento en la app de IBUY. ¡Muchas gracias!`;
      }

      if (statusMsg) {
        addWhatsAppNotification({
          destinatario: 'cliente',
          destinatarioNombre: clientName,
          telefono: clientPhone,
          mensaje: statusMsg,
          tipo: 'CAMBIO_ESTATUS',
          orderId
        });
      }
    }
  };

  // Driver Closes Day (User Request: WhatsApp notification to administrator on day close)
  const handleCloseDriverDay = (
    driverId: string, 
    summary: { totalPedidos: number; totalEfectivo: number; totalGananciasTarifas: number; horaCierre: string }
  ) => {
    const driver = couriers.find(c => c.id === driverId);
    const driverName = driver ? driver.nombre : 'Repartidor Oficial';
    const driverPhone = driver ? driver.telefono : '722-000-0000';

    // Update courier status
    setCouriers(prev => prev.map(c => {
      if (c.id === driverId || c.nombre === driverName) {
        return {
          ...c,
          estado: 'DESCONECTADO',
          corteDelDia: {
            ...summary,
            cerrado: true
          }
        };
      }
      return c;
    }));

    // Send WhatsApp notification to Administrator
    addWhatsAppNotification({
      destinatario: 'administrador',
      destinatarioNombre: 'Administrador IBUY',
      telefono: serviceSchedule.adminWhatsApp,
      mensaje: `📋 NOTIFICACIÓN DE CIERRE DE DÍA:\nEl repartidor ${driverName} (${driverPhone}) ha cerrado su turno a las ${summary.horaCierre} hrs.\n• Total pedidos entregados: ${summary.totalPedidos}\n• Efectivo cobrado a liquidar en central: $${summary.totalEfectivo} MXN\n• Ganancias generadas en tarifas: $${summary.totalGananciasTarifas} MXN.\nTurno marcado como desconectado en el sistema.`,
      tipo: 'CIERRE_DIA'
    });
  };

  // Submit Star Rating for Driver and Business (User Request: 4 & 5)
  const handleSubmitRating = (orderId: string, rating: CalificacionPedido) => {
    let ratedOrder: DispatchedOrder | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          ratedOrder = ord;
          return { ...ord, calificacion: rating };
        }
        return ord;
      })
    );

    const target = ratedOrder || orders.find(o => o.id === orderId);

    // Update Courier average rating
    if (target && target.repartidorAsignado) {
      setCouriers((prev) =>
        prev.map((c) => {
          if (c.nombre === target!.repartidorAsignado) {
            const currentTotal = c.calificacion * c.pedidosCompletados;
            const newCount = c.pedidosCompletados + 1;
            const newAverage = Number(((currentTotal + rating.estrellasRepartidor) / newCount).toFixed(1));
            return {
              ...c,
              calificacion: Math.min(5.0, Math.max(1.0, newAverage)),
              pedidosCompletados: newCount
            };
          }
          return c;
        })
      );
    }

    // Update Business average rating
    if (target && target.data.pedido.establecimiento) {
      setBusinesses((prev) =>
        prev.map((b) => {
          if (b.nombre === target!.data.pedido.establecimiento) {
            const curRating = b.rating || 4.7;
            const newRating = Number(((curRating + rating.estrellasNegocio) / 2).toFixed(1));
            return { ...b, rating: newRating };
          }
          return b;
        })
      );
    }

    // Add rating notification log for Administrator
    addWhatsAppNotification({
      destinatario: 'administrador',
      destinatarioNombre: 'Administrador IBUY',
      telefono: serviceSchedule.adminWhatsApp,
      mensaje: `⭐ NUEVA CALIFICACIÓN de cliente para orden #${orderId}:\n• Repartidor (${target?.repartidorAsignado || 'Chofer'}): ${rating.estrellasRepartidor} estrellas ${rating.comentarioRepartidor ? `("${rating.comentarioRepartidor}")` : ''}\n• Negocio (${target?.data.pedido.establecimiento || 'Comercio'}): ${rating.estrellasNegocio} estrellas ${rating.comentarioNegocio ? `("${rating.comentarioNegocio}")` : ''}`,
      tipo: 'CALIFICACION',
      orderId
    });
  };

  const handleSendDriverMessage = (orderId: string, texto: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      remitente: 'repartidor' as const,
      texto,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              mensajesRepartidor: [...(ord.mensajesRepartidor || []), newMsg]
            }
          : ord
      )
    );
  };

  const handleAssignCourier = (orderId: string, courierName: string, courierPhone: string) => {
    const courierObj = couriers.find(c => c.nombre === courierName);
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              repartidorAsignado: courierName,
              repartidorTelefono: courierPhone,
              repartidorVehiculo: courierObj ? `${courierObj.modeloVehiculo}` : 'Moto',
              repartidorPlacas: courierObj?.placas || '',
              status: 'ASIGNADO'
            }
          : ord
      )
    );
  };

  // Business Management handlers for Administrator
  const handleAddBusiness = (newBiz: Business) => {
    setBusinesses((prev) => [newBiz, ...prev]);
  };

  const handleUpdateBusiness = (updatedBiz: Business) => {
    setBusinesses((prev) => prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b)));
  };

  const handleDeleteBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  };

  const handleReorderBusinesses = (reordered: Business[]) => {
    setBusinesses(reordered);
  };

  // Zones Management handlers for Administrator
  const handleAddZone = (newZone: ZonaConfig) => {
    setZones((prev) => [...prev, newZone]);
  };

  const handleUpdateZone = (updatedZone: ZonaConfig) => {
    setZones((prev) => prev.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
  };

  const handleReorderZones = (reordered: ZonaConfig[]) => {
    setZones(reordered);
  };

  // Service Schedule handler
  const handleUpdateServiceSchedule = (newSchedule: ServiceScheduleConfig) => {
    setServiceSchedule(newSchedule);
  };

  // Courier Management by Administrator (Dar de alta, baja, modificar y ordenar perfiles)
  const handleAddCourier = (newCourier: Courier) => {
    setCouriers((prev) => [newCourier, ...prev]);
  };

  const handleUpdateCourier = (updatedCourier: Courier) => {
    setCouriers((prev) => prev.map((c) => (c.id === updatedCourier.id ? updatedCourier : c)));
  };

  const handleDeleteCourier = (courierId: string) => {
    setCouriers((prev) => prev.filter((c) => c.id !== courierId));
  };

  const handleReorderCouriers = (reordered: Courier[]) => {
    setCouriers(reordered);
  };

  // User Registration by Customer
  const handleRegisterUser = (newUser: UserProfile) => {
    setRegisteredUsers((prev) => [newUser, ...prev]);
  };

  const handleLogin = (session: UserSession) => {
    setCurrentSession(session);
    if (session.role === 'administrador') {
      setActiveRole('admin');
    } else if (session.role === 'repartidor') {
      setActiveRole('driver');
    } else {
      setActiveRole('client');
    }
  };

  const handleLogout = () => {
    setCurrentSession({
      role: 'cliente',
      nombre: '',
      identificador: '',
      comunidadUbicacion: 'Meyuca de Morelos',
      zonaUbicacion: 'Zona 3'
    });
    setActiveRole('client');
  };

  const handleChangeUserLocation = (community: string, zone: ZonaId) => {
    setCurrentSession(prev => ({
      ...prev,
      comunidadUbicacion: community,
      zonaUbicacion: zone
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header & Role Switcher */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        simulatedTime={simulatedTime}
        setSimulatedTime={setSimulatedTime}
        ordersCount={orders.length}
        candidatesCount={candidates.filter(c => c.estado === 'NUEVO').length}
        isAiConnected={isAiConnected}
        currentSession={currentSession}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onChangeUserLocation={handleChangeUserLocation}
        onOpenWhatsAppCenter={() => setIsWhatsAppCenterOpen(true)}
        unreadWhatsAppCount={notifications.filter(n => !n.leido).length}
        serviceSchedule={serviceSchedule}
        zones={zones}
      />

      {/* Main Body per Active Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. CLIENT MODE (Rappi / DiDi Experience) */}
        {activeRole === 'client' && (
          <ClientApp
            simulatedTime={simulatedTime}
            orders={orders}
            businesses={businesses}
            onPlaceOrder={handlePlaceOrder}
            onAdvanceOrderStatus={handleUpdateOrderStatus}
            currentSession={currentSession}
            onChangeUserLocation={handleChangeUserLocation}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenWhatsAppAssistant={() => setActiveRole('assistant')}
            zones={zones}
            serviceSchedule={serviceSchedule}
            onSubmitRating={handleSubmitRating}
          />
        )}

        {/* 2. ADMINISTRATOR MODE (Torre de Despacho & Rastreo GPS - Protected) */}
        {activeRole === 'admin' && (
          currentSession.role === 'administrador' ? (
            <DispatchCenter
              orders={orders}
              couriers={couriers}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onAssignCourier={handleAssignCourier}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Acceso Exclusivo para Administrador</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                El panel de Torre de Control, asignación de pedidos y el Radar GPS de repartidores requiere autenticación con credenciales autorizadas.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Iniciar Sesión como Administrador
              </button>
            </div>
          )
        )}

        {/* 3. BUSINESS MANAGER (Administrador: Agregar, modificar negocios, horarios y su orden) */}
        {activeRole === 'business_manager' && (
          currentSession.role === 'administrador' ? (
            <BusinessManager
              businesses={businesses}
              onAddBusiness={handleAddBusiness}
              onUpdateBusiness={handleUpdateBusiness}
              onDeleteBusiness={handleDeleteBusiness}
              onReorderBusinesses={handleReorderBusinesses}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Acceso Exclusivo para Administrador</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Solo el administrador puede agregar nuevos negocios a la plataforma, editar horarios y cambiar el orden de aparición.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Iniciar Sesión como Administrador
              </button>
            </div>
          )
        )}

        {/* 4. ADMIN ZONES & SERVICE MANAGER (Configurar Zonas, Costos, Horarios del Servicio y Choferes) */}
        {activeRole === 'admin_zones' && (
          currentSession.role === 'administrador' ? (
            <AdminZonesManager
              zones={zones}
              onAddZone={handleAddZone}
              onUpdateZone={handleUpdateZone}
              onDeleteZone={handleDeleteZone}
              onReorderZones={handleReorderZones}
              serviceSchedule={serviceSchedule}
              onUpdateServiceSchedule={handleUpdateServiceSchedule}
              couriers={couriers}
              onAddCourier={handleAddCourier}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Acceso Exclusivo para Administrador</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Solo el administrador puede agregar o quitar zonas, modificar costos de envío, configurar horarios del servicio y dar de alta repartidores.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Iniciar Sesión como Administrador
              </button>
            </div>
          )
        )}

        {/* 4.5. GESTIÓN Y ORDEN DE REPARTIDORES (Administrador: Dar de alta, baja, modificar y ordenar) */}
        {activeRole === 'couriers_manager' && (
          currentSession.role === 'administrador' ? (
            <AdminCouriersManager
              couriers={couriers}
              onAddCourier={handleAddCourier}
              onUpdateCourier={handleUpdateCourier}
              onDeleteCourier={handleDeleteCourier}
              onReorderCouriers={handleReorderCouriers}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Bike className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Acceso Exclusivo para Administrador</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Solo el administrador puede dar de alta, baja, modificar perfiles y organizar el orden de los repartidores.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 text-white font-black text-xs transition shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                Iniciar Sesión como Administrador
              </button>
            </div>
          )
        )}

        {/* 5. DRIVER MODE (Repartidor: Solo ve pedidos asignados, historial de entregas y corte del día) */}
        {activeRole === 'driver' && (
          (currentSession.role === 'repartidor' || currentSession.role === 'administrador') ? (
            <DriverApp
              orders={orders}
              couriers={couriers}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSendDriverMessage={handleSendDriverMessage}
              onCloseDay={handleCloseDriverDay}
              currentSession={currentSession}
              onLogout={handleLogout}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Bike className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Acceso Exclusivo para Repartidores</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inicia sesión con tu perfil de conductor de IBUY para ver tus pedidos asignados, rutas, montos a cobrar y cerrar tu día de trabajo.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 text-white font-black text-xs transition shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                Iniciar Sesión como Repartidor
              </button>
            </div>
          )
        )}

        {/* 6. AI & WHATSAPP ENGINE CONSOLE (Administrador) */}
        {activeRole === 'assistant' && (
          <WhatsAppAssistantConsole
            onProcessMessage={handleProcessMessage}
            onDispatchOrder={handleDispatchFromAssistant}
            simulatedTime={simulatedTime}
            lastProcessedOutput={lastProcessedOutput}
            processingSource={processingSource}
            isProcessing={isProcessing}
          />
        )}

        {/* 7. ZONES & SCHEDULES DIRECTORY */}
        {activeRole === 'zones' && (
          <ZonesAndCoverageMap simulatedTime={simulatedTime} />
        )}
      </main>

      {/* Auth Modal for Role Login & Customer Registration */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        currentSession={currentSession}
        registeredUsers={registeredUsers}
        onRegisterUser={handleRegisterUser}
        couriers={couriers}
        onRegisterDriver={handleAddCourier}
      />

      {/* WhatsApp Notification Drawer Center */}
      <WhatsAppNotificationCenter
        notifications={notifications}
        isOpen={isWhatsAppCenterOpen}
        onClose={() => setIsWhatsAppCenterOpen(false)}
        onClearNotifications={() => setNotifications([])}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-300">IBUY Coatepec</strong> • Plataforma de Mandados, Restaurantes y Logística Regional
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Zonas activas: {zones.length}</span>
            <span>•</span>
            <span>Repartidores: {couriers.length}</span>
            <span>•</span>
            <button
              onClick={() => setIsWhatsAppCenterOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Alertas WhatsApp ({notifications.length})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
