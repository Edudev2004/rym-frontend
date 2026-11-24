import { useEffect, useState } from 'react';
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
    <div className="space-y-6 pb-20 md:pb-6 text-white">
      {/* Saludo y bienvenida — Estricto Negro, Blanco y Dorado */}
      <div className="bg-[#0A0A0C] border border-brand-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <span className="text-xs font-bold bg-brand-500/15 text-brand-500 border border-brand-500/40 px-3.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          MVP R&M Personaliza — Fase 1
        </span>
        <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">
          Panel de Control Operativo
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-xl">
          Monitoreo en tiempo real de recepción, fabricación, kardex de insumos y comprobantes de pago.
        </p>

        {/* Acciones Rápidas */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('kardex')}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-black font-black rounded-xl text-xs transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Package className="w-4 h-4" /> Ver Kardex & Stock de Insumos
          </button>
        </div>
      </div>

      {/* Grid de KPIs del Día — Diseño Uniforme en Blanco, Negro y Dorado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Pedidos Pendientes */}
        <div className="bg-[#11141C] p-4 sm:p-5 rounded-2xl border border-[#222634] shadow-sm flex items-center gap-3.5 hover:border-brand-500/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pedidos Pendientes</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {metricas?.pedidos_pendientes ?? 0}
            </p>
          </div>
        </div>

        {/* KPI 2: En Producción */}
        <div className="bg-[#11141C] p-4 sm:p-5 rounded-2xl border border-[#222634] shadow-sm flex items-center gap-3.5 hover:border-brand-500/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-500 flex items-center justify-center shrink-0">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">En Producción</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {metricas?.pedidos_en_produccion ?? 0}
            </p>
          </div>
        </div>

        {/* KPI 3: Insumos en Alerta */}
        <div className="bg-[#11141C] p-4 sm:p-5 rounded-2xl border border-[#222634] shadow-sm flex items-center gap-3.5 hover:border-brand-500/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Insumos en Alerta</p>
            <p className="text-xl sm:text-2xl font-black text-brand-500 mt-0.5">
              {alertas.length}
            </p>
          </div>
        </div>

        {/* KPI 4: Ventas del Mes */}
        <div className="bg-[#11141C] p-4 sm:p-5 rounded-2xl border border-[#222634] shadow-sm flex items-center gap-3.5 hover:border-brand-500/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Ventas del Mes</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              S/ {metricas?.total_ventas_mes.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Widget Crítico: Alertas de Stock Mínimo (CU07) */}
      <div className="bg-[#11141C] border border-[#222634] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></div>
            <h2 className="font-bold text-white text-base sm:text-lg">
              Alertas de Stock Mínimo (CU07)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('kardex')}
            className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-0.5 transition-colors"
          >
            Gestionar Insumos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {alertas.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Todos los insumos cuentan con saldo superior al stock mínimo de seguridad.
          </p>
        ) : (
          <div className="space-y-3">
            {alertas.map(a => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-brand-500/30 bg-[#0A0A0C] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="p-2.5 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/30 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{a.nombre}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-slate-800 text-brand-500">
                        {a.codigo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{a.mensaje}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] text-slate-400">Saldo / Mínimo</p>
                    <p className="font-bold text-sm text-brand-500">
                      {a.stock_actual} / {a.stock_minimo} {a.unidad_medida}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('kardex')}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-brand-500 hover:bg-brand-400 text-black shadow-md shadow-brand-500/10 transition-all cursor-pointer active:scale-95"
                  >
                    Reponer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
