/**
 * Cliente HTTP y Servicio de Integración con Backend FastAPI
 * Incluye fallback inteligente para pruebas frontend autónomas.
 */
import { Insumo, AlertaStock, MovimientoKardex, DashboardMetricas, Usuario, CrearInsumoDTO, Consulta, CrearConsultaDTO } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Insumos iniciales de demostración si el backend aún no está encendido
const DEMO_INSUMOS: Insumo[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    codigo: "INS-TAZ-01",
    nombre: "Taza de Cerámica Blanca 11oz",
    unidad_medida: "UND",
    stock_actual: 25.0,
    stock_minimo: 10.0,
    costo_unitario: 4.50,
    descripcion: "Taza lisa para sublimación",
    esta_en_alerta: false,
    estado_alerta: "NORMAL",
    activo: true
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    codigo: "INS-TAZ-02",
    nombre: "Taza Mágica Negra 11oz",
    unidad_medida: "UND",
    stock_actual: 8.0,
    stock_minimo: 10.0,
    costo_unitario: 8.00,
    descripcion: "Taza sensible al calor",
    esta_en_alerta: true,
    estado_alerta: "ALERTA_AMARILLO",
    activo: true
  },
  {
    id: "22222222-2222-2222-2222-222222222206",
    codigo: "INS-POL-01",
    nombre: "Polo Algodón 20/1 Blanco Talla M",
    unidad_medida: "UND",
    stock_actual: 3.0,
    stock_minimo: 6.0,
    costo_unitario: 12.00,
    descripcion: "Prenda base estampada",
    esta_en_alerta: true,
    estado_alerta: "CRITICO_ROJO",
    activo: true
  }
];

// Consultas iniciales de demostración
const DEMO_CONSULTAS: Consulta[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    canal: "WHATSAPP",
    remitente_nombre: "Lucero Falcon",
    remitente_contacto: "+51944556677",
    mensaje: "Hola, buenas tardes, quisiera cotizar 3 tazas mágicas para aniversario con fotos familiares.",
    estado: "PENDIENTE",
    fecha_recepcion: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    canal: "FACEBOOK",
    remitente_nombre: "Marcos Benitez",
    remitente_contacto: "fb.me/mbenitez99",
    mensaje: "Buenas, hacen envíos a San Martín de Porres hoy mismo si pido una taza blanca?",
    estado: "PENDIENTE",
    fecha_recepcion: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    canal: "TIKTOK",
    remitente_nombre: "kary_crafts",
    remitente_contacto: "@kary_crafts",
    mensaje: "Hola vi su video en TikTok del polo con foto de perrito, cuánto demora la entrega?",
    estado: "ATENDIDA",
    fecha_recepcion: new Date(Date.now() - 3600000 * 24).toISOString(),
    fecha_atencion: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

export const apiService = {
  // Insumos y Kardex (CU06, CU07)
  async getInsumos(): Promise<Insumo[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/kardex/insumos`);
      if (res.ok) return await res.json();
    } catch {
      // Backend offline: usar datos demo
    }
    return DEMO_INSUMOS;
  },

  async crearInsumo(data: CrearInsumoDTO): Promise<Insumo> {
    try {
      const res = await fetch(`${API_BASE_URL}/kardex/insumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback local
    }

    // Autogeneración de código en frontend si backend no responde
    const palabras = data.nombre.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase().split(/\s+/).filter(w => w.length >= 3);
    const prefix = palabras.length > 0 ? palabras[0].substring(0, 3) : 'GEN';
    const existentes = DEMO_INSUMOS.filter(i => i.codigo.startsWith(`INS-${prefix}-`));
    const nextNum = existentes.length + 1;
    const codigoFinal = data.codigo?.trim() || `INS-${prefix}-${String(nextNum).padStart(2, '0')}`;

    const stockInicial = Number(data.stock_inicial || 0);
    const stockMinimo = Number(data.stock_minimo || 5);
    const estadoAlerta = stockInicial === 0
      ? 'CRITICO_AGOTADO'
      : (stockInicial <= stockMinimo / 2 ? 'CRITICO_ROJO' : (stockInicial <= stockMinimo ? 'ALERTA_AMARILLO' : 'NORMAL'));

    const nuevo: Insumo = {
      id: `demo-${Date.now()}`,
      codigo: codigoFinal,
      nombre: data.nombre.trim(),
      unidad_medida: data.unidad_medida,
      stock_actual: stockInicial,
      stock_minimo: stockMinimo,
      costo_unitario: Number(data.costo_unitario || 0),
      descripcion: data.descripcion,
      esta_en_alerta: stockInicial <= stockMinimo,
      estado_alerta: estadoAlerta,
      activo: true,
      created_at: new Date().toISOString()
    };
    DEMO_INSUMOS.push(nuevo);
    return nuevo;
  },

  async eliminarInsumo(insumoId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/kardex/insumos/${insumoId}`, {
        method: 'DELETE'
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }

    const idx = DEMO_INSUMOS.findIndex(i => i.id === insumoId);
    if (idx !== -1) {
      DEMO_INSUMOS.splice(idx, 1);
      return true;
    }
    return false;
  },

  async getAlertas(): Promise<AlertaStock[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/kardex/alertas`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return DEMO_INSUMOS
      .filter(i => i.esta_en_alerta)
      .map(i => ({
        id: i.id,
        codigo: i.codigo,
        nombre: i.nombre,
        unidad_medida: i.unidad_medida,
        stock_actual: i.stock_actual,
        stock_minimo: i.stock_minimo,
        estado_alerta: i.estado_alerta,
        mensaje: i.estado_alerta === 'CRITICO_ROJO'
          ? `¡CRÍTICO! Saldo (${i.stock_actual}) por debajo del 50% del stock mínimo.`
          : `Alerta: Saldo (${i.stock_actual}) llegó al stock mínimo (${i.stock_minimo}).`
      }));
  },

  async registrarMovimiento(data: {
    insumo_id: string;
    tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    motivo: string;
    cantidad: number;
    observaciones?: string;
  }): Promise<MovimientoKardex> {
    const res = await fetch(`${API_BASE_URL}/kardex/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error al registrar movimiento' }));
      throw new Error(err.detail || 'Error en kardex');
    }
    return await res.json();
  },

  async getMetricasDashboard(): Promise<DashboardMetricas> {
    return {
      pedidos_pendientes: 4,
      pedidos_en_produccion: 2,
      pedidos_listos_entrega: 3,
      total_alertas_stock: 2,
      consultas_pendientes: 5,
      total_ventas_mes: 3450.00
    };
  },

  // Autenticación (ModSeguridad)
  async login(correo: string, password: string): Promise<{ access_token: string; usuario: Usuario }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline: fallback a usuarios mock por rol
    }

    // Fallback de usuarios oficiales para demostración
    const rolMap: Record<string, { nombre: string; rol: any }> = {
      'admin@rympersonaliza.pe': { nombre: 'Rommel Navarro (Admin)', rol: 'ADMINISTRADOR' },
      'marketing@rympersonaliza.pe': { nombre: 'Valeria Rios (Marketing)', rol: 'MARKETING' },
      'diseno@rympersonaliza.pe': { nombre: 'Carlos Mendez (Diseñador)', rol: 'DISENADOR' },
      'produccion@rympersonaliza.pe': { nombre: 'Jorge Lopez (Operador)', rol: 'OPERADOR' }
    };

    const userMock = rolMap[correo.toLowerCase()] || {
      nombre: 'Usuario Demostración',
      rol: 'ADMINISTRADOR'
    };

    return {
      access_token: 'demo-jwt-token-rym',
      usuario: {
        id: '00000000-0000-0000-0000-000000000001',
        nombre: userMock.nombre,
        correo: correo,
        rol: userMock.rol,
        activo: true
      }
    };
  },

  // Consultas Multicanal (CU01)
  async getConsultas(canal?: string, estado?: string): Promise<Consulta[]> {
    try {
      const params = new URLSearchParams();
      if (canal && canal !== 'TODOS') params.append('canal', canal);
      if (estado && estado !== 'TODOS') params.append('estado', estado);
      const url = `${API_BASE_URL}/consultas${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    let resultado = [...DEMO_CONSULTAS];
    if (canal && canal !== 'TODOS') {
      resultado = resultado.filter(c => c.canal.toUpperCase() === canal.toUpperCase());
    }
    if (estado && estado !== 'TODOS') {
      resultado = resultado.filter(c => c.estado.toUpperCase() === estado.toUpperCase());
    }
    return resultado;
  },

  async crearConsulta(data: CrearConsultaDTO): Promise<Consulta> {
    try {
      const res = await fetch(`${API_BASE_URL}/consultas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const nueva: Consulta = {
      id: `cons-${Date.now()}`,
      canal: data.canal,
      remitente_nombre: data.remitente_nombre.trim(),
      remitente_contacto: data.remitente_contacto.trim(),
      mensaje: data.mensaje.trim(),
      estado: 'PENDIENTE',
      cliente_id: data.cliente_id,
      fecha_recepcion: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    DEMO_CONSULTAS.unshift(nueva);
    return nueva;
  },

  async actualizarEstadoConsulta(id: string, nuevoEstado: 'PENDIENTE' | 'ATENDIDA' | 'CANCELADA'): Promise<Consulta> {
    try {
      const res = await fetch(`${API_BASE_URL}/consultas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const c = DEMO_CONSULTAS.find(item => item.id === id);
    if (c) {
      c.estado = nuevoEstado;
      if (nuevoEstado === 'ATENDIDA') {
        c.fecha_atencion = new Date().toISOString();
      }
      return c;
    }
    throw new Error('Consulta no encontrada');
  },

  async convertirConsultaAPedido(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/consultas/${id}/convertir`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const c = DEMO_CONSULTAS.find(item => item.id === id);
    if (c) {
      c.estado = 'ATENDIDA';
      c.fecha_atencion = new Date().toISOString();
      return {
        mensaje: 'Consulta convertida a pedido con éxito',
        consulta_id: c.id,
        cliente_sugerido: {
          nombres: c.remitente_nombre,
          telefono: c.remitente_contacto,
          canal_contacto: c.canal
        },
        detalle_pedido_sugerido: {
          canal_origen: c.canal,
          notas: `Pedido generado desde consulta: ${c.mensaje}`
        }
      };
    }
    throw new Error('Consulta no encontrada');
  }
};
