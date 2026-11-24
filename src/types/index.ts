/**
 * Interfaces TypeScript de Dominio - R&M Personaliza
 * Alineadas 1:1 con los esquemas Pydantic del Backend FastAPI
 */

export type RolUsuario = 'ADMINISTRADOR' | 'MARKETING' | 'DISENADOR' | 'OPERADOR';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  activo: boolean;
  created_at?: string;
}

export type EstadoAlerta = 'NORMAL' | 'ALERTA_AMARILLO' | 'CRITICO_ROJO' | 'CRITICO_AGOTADO';

export interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
  esta_en_alerta: boolean;
  estado_alerta: EstadoAlerta;
  activo: boolean;
  created_at?: string;
}

export interface CrearInsumoDTO {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  stock_inicial: number;
  stock_minimo: number;
  costo_unitario: number;
}

export interface AlertaStock {
  id: string;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  estado_alerta: EstadoAlerta;
  mensaje: string;
}

export interface MovimientoKardex {
  id: string;
  insumo_id: string;
  tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  motivo: 'COMPRA' | 'PRODUCCION_PEDIDO' | 'AJUSTE_INVENTARIO' | 'MERMA' | 'INVENTARIO_INICIAL';
  cantidad: number;
  saldo_anterior: number;
  saldo_posterior: number;
  pedido_id?: string;
  observaciones?: string;
  fecha?: string;
}

export interface DashboardMetricas {
  pedidos_pendientes: number;
  pedidos_en_produccion: number;
  pedidos_listos_entrega: number;
  total_alertas_stock: number;
  consultas_pendientes: number;
  total_ventas_mes: number;
}
