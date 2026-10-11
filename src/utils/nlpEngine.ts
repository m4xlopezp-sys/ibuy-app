import type { IbuyOutput, ZonaId, ItemPedido } from '../types/ibuy.js';
import { ZONAS_COATEPEC, COMERCIOS_COATEPEC, PATROCINIOS_DESTACADOS } from '../data/ibuyData.js';

interface ProcessOptions {
  simulatedTime?: string; // "HH:MM" e.g. "17:38"
}

/**
 * Checks if a given time is within open/close range
 */
export function isStoreOpen(openTime: string, closeTime: string, is24h: boolean | undefined, currentTime: string): boolean {
  if (is24h) return true;
  if (!openTime || !closeTime) return true;

  const [currH, currM] = currentTime.split(':').map(Number);
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);

  const currentMinutes = currH * 60 + currM;
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes >= openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  } else {
    // Overnight store (e.g. 20:00 to 04:00)
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }
}

/**
 * Helper to extract phone number from text
 */
function extractPhone(text: string): string | null {
  const match = text.match(/(\+?52\s?)?(\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/);
  return match ? match[0].trim() : null;
}

/**
 * Deterministic NLP Engine for IBUY Coatepec de Harinas
 * Guarantees strict output format and adherence to all business rules.
 */
export function processIbuyMessageLocally(message: string, options: ProcessOptions = {}): IbuyOutput {
  const text = message.trim();
  const lower = text.toLowerCase();
  const currentTime = options.simulatedTime || '14:30';

  // 1. Check for RECRUITMENT intent
  const recruitmentKeywords = [
    'trabajar', 'empleo', 'chamba', 'vacante', 'repartidor', 'unirme', 
    'solicito empleo', 'busco trabajo', 'meter moto', 'entrar a repartir', 
    'solicitud', 'curriculum', 'trabajo de moto', 'repartir'
  ];
  const isRecruitment = recruitmentKeywords.some(kw => lower.includes(kw));

  if (isRecruitment) {
    const phone = extractPhone(text);
    
    // Extract candidate name if present (e.g. "me llamo Carlos", "soy Pedro Gómez", "mi nombre es...")
    let name: string | null = null;
    const nameMatch = text.match(/(?:me llamo|soy|mi nombre es|atentamente|atenciosamente)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)?)/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    }

    // Vehicle detection
    let vehicle = 'Moto';
    if (lower.includes('bici') || lower.includes('bicicleta')) {
      vehicle = 'Bicicleta';
    } else if (lower.includes('auto') || lower.includes('coche') || lower.includes('carro') || lower.includes('camioneta')) {
      vehicle = 'Auto';
    } else if (lower.includes('italika') || lower.includes('honda') || lower.includes('yamaha') || lower.includes('pulsar') || lower.includes('vento') || lower.includes('moto')) {
      const motoMatch = text.match(/(italika|honda|pulsar|yamaha|vento|bajaj|susuki)\s*[\w\d]*/i);
      vehicle = motoMatch ? `Moto (${motoMatch[0]})` : 'Moto';
    }

    const randomSponsor = PATROCINIOS_DESTACADOS[Math.floor(Math.random() * PATROCINIOS_DESTACADOS.length)];

    return {
      accion_detectada: 'RECLUTAMIENTO',
      cliente: {
        nombre: name,
        direccion_entrega: 'Base Central IBUY Coatepec de Harinas',
        zona: 'Zona 1'
      },
      pedido: {
        establecimiento: 'Oficinas de Reclutamiento IBUY',
        items: [
          {
            producto: `Registro de Aspirante a Repartidor (${vehicle})`,
            cantidad: 1,
            notas: phone ? `Teléfono de contacto: ${phone}` : 'Pendiente teléfono'
          }
        ],
        subtotal_estimado: 0.0,
        costo_envio: 0.0,
        total_estimado: 0.0,
        metodo_pago: 'Efectivo',
        cambio_para: 0.0
      },
      logistica: {
        requiere_confirmacion_stock: false,
        tiempo_estimado_entrega_minutos: 'Inmediato',
        mensaje_estado: `¡Bienvenido a IBUY Coatepec! Hemos recibido tu solicitud para unirte a nuestra flotilla de repartidores en ${vehicle}. Nuestro coordinador operativo te contactará al ${phone || 'teléfono proporcionado'} para agendar tu entrevista y activación en la app.`
      },
      promocion_patrocinada: {
        mostrar: true,
        negocio: randomSponsor.negocio,
        mensaje: randomSponsor.mensaje
      },
      datos_reclutamiento: {
        es_solicitud: true,
        nombre_candidato: name || (phone ? `Aspirante (${phone})` : 'Candidato Interesado'),
        telefono: phone,
        vehiculo: vehicle
      }
    };
  }

  // 2. Check for STATUS / SEGUIMIENTO intent
  const seguimientoKeywords = ['mi pedido', 'donde viene', 'estatus', 'cuanto le falta', 'tarda mucho', 'ya viene', 'seguimiento'];
  const isSeguimiento = seguimientoKeywords.some(kw => lower.includes(kw));
  if (isSeguimiento) {
    const randomSponsor = PATROCINIOS_DESTACADOS[Math.floor(Math.random() * PATROCINIOS_DESTACADOS.length)];
    return {
      accion_detectada: 'SEGUIMIENTO',
      cliente: {
        nombre: null,
        direccion_entrega: 'Ubicación de entrega registrada',
        zona: 'Zona 1'
      },
      pedido: {
        establecimiento: 'IBUY Despacho Central',
        items: [
          {
            producto: 'Seguimiento de orden activa',
            cantidad: 1,
            notas: 'Monitoreo GPS'
          }
        ],
        subtotal_estimado: 0.0,
        costo_envio: 0.0,
        total_estimado: 0.0,
        metodo_pago: 'Efectivo',
        cambio_para: 0.0
      },
      logistica: {
        requiere_confirmacion_stock: false,
        tiempo_estimado_entrega_minutos: '10-15',
        mensaje_estado: 'Tu repartidor de IBUY va en trayecto a tu domicilio. Puedes monitorear su llegada directamente desde este chat.'
      },
      promocion_patrocinada: {
        mostrar: true,
        negocio: randomSponsor.negocio,
        mensaje: randomSponsor.mensaje
      },
      datos_reclutamiento: {
        es_solicitud: false,
        nombre_candidato: null,
        telefono: null,
        vehiculo: null
      }
    };
  }

  // 3. Zone Identification
  let detectedZone: ZonaId = 'Zona 1';
  let deliveryAddress = 'Centro, Coatepec de Harinas';

  // Zone 4 keywords
  if (lower.includes('ixtapan') || lower.includes('tonatico') || lower.includes('villa guerrero') || lower.includes('almoloya de alquisiras')) {
    detectedZone = 'Zona 4';
    if (lower.includes('ixtapan')) deliveryAddress = 'Ixtapan de la Sal';
    else if (lower.includes('tonatico')) deliveryAddress = 'Tonatico';
    else if (lower.includes('villa guerrero')) deliveryAddress = 'Villa Guerrero';
    else deliveryAddress = 'Municipio Vecino (Zona 4)';
  }
  // Zone 3 keywords
  else if (
    lower.includes('meyuca') || lower.includes('tepehuajes') || lower.includes('el salto') || 
    lower.includes('las juntas') || lower.includes('piedras anchas') || lower.includes('chiltepec') ||
    lower.includes('cuentla') || lower.includes('acuitlapilco') || lower.includes('san luis') ||
    lower.includes('llano grande') || lower.includes('cochisquila') || lower.includes('agua bendita')
  ) {
    detectedZone = 'Zona 3';
    if (lower.includes('meyuca')) deliveryAddress = 'Meyuca de Morelos';
    else if (lower.includes('tepehuajes')) deliveryAddress = 'Tepehuajes';
    else if (lower.includes('el salto')) deliveryAddress = 'El Salto';
    else if (lower.includes('las juntas')) deliveryAddress = 'Las Juntas';
    else if (lower.includes('chiltepec')) deliveryAddress = 'Chiltepec de Hidalgo';
    else deliveryAddress = 'Comunidad / Ranchería (Zona 3)';
  }
  // Zone 2 keywords
  else if (
    lower.includes('zacango') || lower.includes('san miguel') || lower.includes('ixtlahuaca') || 
    lower.includes('el durazno') || lower.includes('panteon') || lower.includes('panteón') || 
    lower.includes('primera seccion') || lower.includes('primera sección') || lower.includes('la union') || lower.includes('la unión')
  ) {
    detectedZone = 'Zona 2';
    if (lower.includes('zacango')) deliveryAddress = 'Zacango, Coatepec';
    else if (lower.includes('san miguel')) deliveryAddress = 'Barrio San Miguel';
    else if (lower.includes('el durazno')) deliveryAddress = 'El Durazno';
    else deliveryAddress = 'Colonia Periférica (Zona 2)';
  } else {
    // Zone 1
    detectedZone = 'Zona 1';
    if (lower.includes('calvario')) deliveryAddress = 'Barrio El Calvario';
    else if (lower.includes('la palma')) deliveryAddress = 'Barrio La Palma';
    else if (lower.includes('cruz blanca')) deliveryAddress = 'Cruz Blanca';
    else if (lower.includes('plaza de toros')) deliveryAddress = 'Plaza de Toros';
    else deliveryAddress = 'Cabecera Municipal / Centro';
  }

  // 4. Establishment Detection
  let matchedBusiness = COMERCIOS_COATEPEC.find(b => {
    const bName = b.nombre.toLowerCase();
    const parts = bName.split(' ');
    return parts.some(p => p.length > 4 && lower.includes(p.toLowerCase()));
  });

  if (!matchedBusiness) {
    if (lower.includes('barbacoa') || lower.includes('mary') || lower.includes('consome') || lower.includes('borrego')) {
      matchedBusiness = COMERCIOS_COATEPEC[0]; // Doña Mary
    } else if (lower.includes('guadalajara') || lower.includes('farmacia') || lower.includes('pastillas') || lower.includes('medicina')) {
      matchedBusiness = COMERCIOS_COATEPEC[1]; // Farmacia Guadalajara
    } else if (lower.includes('similares') || lower.includes('simi')) {
      matchedBusiness = COMERCIOS_COATEPEC[2]; // Similares
    } else if (lower.includes('pizza') || lower.includes('giovanni') || lower.includes('pizzas') || lower.includes('hawaiana')) {
      matchedBusiness = COMERCIOS_COATEPEC[3]; // Pizzería Don Giovanni
    } else if (lower.includes('cremeria') || lower.includes('leche') || lower.includes('huevo') || lower.includes('abarrotes')) {
      matchedBusiness = COMERCIOS_COATEPEC[4]; // La Central
    } else if (lower.includes('taco') || lower.includes('guero') || lower.includes('canasta')) {
      matchedBusiness = COMERCIOS_COATEPEC[5]; // Tacos el Güero
    } else if (lower.includes('fruta') || lower.includes('verdura') || lower.includes('aguacate') || lower.includes('jitomate')) {
      matchedBusiness = COMERCIOS_COATEPEC[6]; // Los Fresnos
    } else if (lower.includes('ferreteria') || lower.includes('tlapaleria') || lower.includes('candado') || lower.includes('foco')) {
      matchedBusiness = COMERCIOS_COATEPEC[7]; // Ferretería
    } else {
      matchedBusiness = COMERCIOS_COATEPEC[8]; // Mandado Particular
    }
  }

  // 5. Store Open / Close Validation
  const isOpen = isStoreOpen(
    matchedBusiness.horarioApertura,
    matchedBusiness.horarioCierre,
    matchedBusiness.es24Horas,
    currentTime
  );

  // Check if query is just to ask for schedule
  const isHorarioQuery = (lower.includes('horario') || lower.includes('abierto') || lower.includes('cierran') || lower.includes('a que hora')) && !lower.includes('traeme') && !lower.includes('mandame') && !lower.includes('quiero pedir');
  const action: 'CREAR_PEDIDO' | 'CONSULTAR_HORARIO' = isHorarioQuery ? 'CONSULTAR_HORARIO' : 'CREAR_PEDIDO';

  // 6. Stock Confirmation Flag Check (Inventory confirmation removed per user request)
  const requiresStockConfirmation = false;

  // 7. Calculate Pricing
  const zoneConfig = ZONAS_COATEPEC[detectedZone];
  const deliveryCost = zoneConfig.tarifaBase;

  // Items extraction
  const items: ItemPedido[] = [];
  
  // Try to match popular items
  let subtotal = 0;
  matchedBusiness.popularItems.forEach(pi => {
    if (lower.includes(pi.nombre.toLowerCase().split(' ')[0])) {
      items.push({
        producto: pi.nombre,
        cantidad: 1,
        notas: null
      });
      subtotal += pi.precioEstimado;
    }
  });

  if (items.length === 0) {
    // Generic fallback based on request
    items.push({
      producto: text.length > 50 ? `${text.slice(0, 47)}...` : text,
      cantidad: 1,
      notas: 'Verificar especificaciones y marca con el cliente'
    });
    subtotal = 120.0;
  }

  // Payment Method & Change detection
  let metodoPago: 'Efectivo' | 'Transferencia' = 'Efectivo';
  if (lower.includes('transferencia') || lower.includes('transferir') || lower.includes('spei')) {
    metodoPago = 'Transferencia';
  }

  let cambioPara = 0.0;
  const cambioMatch = text.match(/(?:pago con|cambio de|billete de|llevo)\s*\$?(\d+)/i);
  if (cambioMatch) {
    cambioPara = parseFloat(cambioMatch[1]);
  } else if (metodoPago === 'Efectivo') {
    // Default cash note recommendation
    const totalEst = subtotal + deliveryCost;
    cambioPara = totalEst > 200 ? 500 : 200;
  }

  const total = subtotal + deliveryCost;

  // Build Status Message based on openness
  let mensajeEstado = '';
  if (!isOpen) {
    mensajeEstado = `NEGOCIO_CERRADO: El establecimiento "${matchedBusiness.nombre}" se encuentra cerrado a esta hora (${currentTime} hrs). Su horario de atención es de ${matchedBusiness.horarioApertura} a ${matchedBusiness.horarioCierre} hrs. Podemos programar tu pedido para el horario de apertura o sugerirte una alternativa abierta.`;
  } else if (requiresStockConfirmation) {
    mensajeEstado = `Pedido registrado. Se envió orden a verificación de stock en "${matchedBusiness.nombre}". Un repartidor IBUY validará la disponibilidad en mostrador antes de proceder al cobro.`;
  } else {
    mensajeEstado = `Pedido confirmado para entrega en ${deliveryAddress} (${detectedZone}). Tarifa de envío: $${deliveryCost} MXN. Repartidor asignado en camino al establecimiento.`;
  }

  // 8. Monetization / Sponsored Promo
  // Pick a sponsor that is NOT the same as the current establishment (to cross-sell)
  const availableSponsors = PATROCINIOS_DESTACADOS.filter(s => !s.negocio.toLowerCase().includes(matchedBusiness!.nombre.toLowerCase()));
  const chosenSponsor = availableSponsors.length > 0 ? availableSponsors[Math.floor(Math.random() * availableSponsors.length)] : PATROCINIOS_DESTACADOS[0];

  // Customer Name extraction
  let clienteNombre: string | null = null;
  const nameMatch = text.match(/(?:a nombre de|me llamo|soy)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)?)/i);
  if (nameMatch) {
    clienteNombre = nameMatch[1].trim();
  }

  return {
    accion_detectada: action,
    cliente: {
      nombre: clienteNombre,
      direccion_entrega: deliveryAddress,
      zona: detectedZone
    },
    pedido: {
      establecimiento: matchedBusiness.nombre,
      items: items,
      subtotal_estimado: subtotal,
      costo_envio: deliveryCost,
      total_estimado: total,
      metodo_pago: metodoPago,
      cambio_para: cambioPara
    },
    logistica: {
      requiere_confirmacion_stock: requiresStockConfirmation,
      tiempo_estimado_entrega_minutos: zoneConfig.tiempoEstimado,
      mensaje_estado: mensajeEstado
    },
    promocion_patrocinada: {
      mostrar: true,
      negocio: chosenSponsor.negocio,
      mensaje: chosenSponsor.mensaje
    },
    datos_reclutamiento: {
      es_solicitud: false,
      nombre_candidato: null,
      telefono: null,
      vehiculo: null
    }
  };
}
