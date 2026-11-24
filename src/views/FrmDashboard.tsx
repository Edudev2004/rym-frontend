import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { DashboardMetricas, AlertaStock } from '../types';
import {
  Clock,
  Hammer,
  AlertTriangle,
  TrendingUp,
  Package,
  ChevronRight
} from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

export const FrmDashboard: React.FC<Props> = ({ onNavigate }) => {
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [m, a] = await Promise.all([
      apiService.getMetricasDashboard(),
      apiService.getAlertas()
    ]);
    setMetricas(m);
    setAlertas(a);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Saludo y bienvenida */}
      <div className="bg-gradient-to-r from-brand-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/10">
        <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
          MVP R&M Personaliza — Fase 1
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
          Panel de Control Operativo
        </h1>
        <p className="text-rose-100 text-sm mt-1 max-w-xl">
          Monitoreo en tiempo real de recepción, fabricación, kardex de insumos y comprobantes de pago.
        </p>

        {/* Acciones Rápidas */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('kardex')}
            className="px-4 py-2 bg-white text-brand-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" /> Ver Kardex & Stock
          </button>
        </div>
      </div>

      {/* Grid de KPIs del Día */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pedidos Pendientes</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {metricas?.pedidos_pendientes ?? 0}
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">En Producción</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {metricas?.pedidos_en_produccion ?? 0}
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Insumos en Alerta</p>
            <p className="text-xl sm:text-2xl font-black text-red-600 mt-0.5">
              {alertas.length}
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Ventas del Mes</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
              S/ {metricas?.total_ventas_mes.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Widget Crítico: Alertas de Stock Mínimo (Semáforo Rojo/Amarillo) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">
              Alertas de Stock Mínimo (CU07)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('kardex')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
          >
            Gestionar Insumos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {alertas.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Todos los insumos cuentan con saldo superior al stock mínimo de seguridad.
          </p>
        ) : (
          <div className="space-y-2.5">
            {alertas.map(a => {
              const esCritico = a.estado_alerta === 'CRITICO_ROJO' || a.estado_alerta === 'CRITICO_AGOTADO';

              return (
                <div
                  key={a.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    esCritico
                      ? 'bg-red-50/60 border-red-200 text-red-900'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      esCritico ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{a.nombre}</span>
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/70">
                          {a.codigo}
                        </span>
                      </div>
                      <p className="text-xs opacity-80 mt-0.5">{a.mensaje}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Saldo / Mínimo</p>
                      <p className="font-bold text-sm">
                        {a.stock_actual} / {a.stock_minimo} {a.unidad_medida}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('kardex')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                        esCritico
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}
                    >
                      Reponer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
