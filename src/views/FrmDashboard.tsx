import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { DashboardMetricas, AlertaStock } from '../types';
import { GoldSpinner } from '../components/GoldSpinner';
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
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [m, a] = await Promise.all([
        apiService.getMetricasDashboard(),
        apiService.getAlertas()
      ]);
      setMetricas(m);
      setAlertas(a);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-slate-800">
      {/* Banner Principal — Fondo Blanco Puro con Acentos en Oro y Negro */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold bg-[#D4AF37]/15 text-[#997A15] border border-[#D4AF37]/40 px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            MVP R&M Personaliza — Fase 1
          </span>
          {cargando && (
            <GoldSpinner size="sm" texto="Sincronizando..." />
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-slate-900">
          Panel de Control Operativo
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-xl">
          Monitoreo en tiempo real de recepción, fabricación, kardex de insumos y comprobantes de pago.
        </p>

        {/* Acciones Rápidas */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('kardex')}
            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs transition-all shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Package className="w-4 h-4" /> Ver Kardex & Stock de Insumos
          </button>
        </div>
      </div>

      {/* Grid de KPIs del Día — Tarjetas Blancas con Acentos Dorados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Pedidos Pendientes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:border-[#D4AF37] transition-all">
          <div className="w-12 h-12 rounded-xl bg-black border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pedidos Pendientes</p>
            {cargando ? (
              <div className="mt-1"><GoldSpinner size="xs" /></div>
            ) : (
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {metricas?.pedidos_pendientes ?? 0}
              </p>
            )}
          </div>
        </div>

        {/* KPI 2: En Producción */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:border-[#D4AF37] transition-all">
          <div className="w-12 h-12 rounded-xl bg-black border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm">
            <Hammer className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">En Producción</p>
            {cargando ? (
              <div className="mt-1"><GoldSpinner size="xs" /></div>
            ) : (
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {metricas?.pedidos_en_produccion ?? 0}
              </p>
            )}
          </div>
        </div>

        {/* KPI 3: Insumos en Alerta */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:border-[#D4AF37] transition-all">
          <div className="w-12 h-12 rounded-xl bg-black border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Insumos en Alerta</p>
            {cargando ? (
              <div className="mt-1"><GoldSpinner size="xs" /></div>
            ) : (
              <p className="text-xl sm:text-2xl font-black text-[#997A15] mt-0.5">
                {alertas.length}
              </p>
            )}
          </div>
        </div>

        {/* KPI 4: Ventas del Mes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:border-[#D4AF37] transition-all">
          <div className="w-12 h-12 rounded-xl bg-black border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Ventas del Mes</p>
            {cargando ? (
              <div className="mt-1"><GoldSpinner size="xs" /></div>
            ) : (
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                S/ {metricas?.total_ventas_mes.toFixed(2) ?? '0.00'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Widget Crítico: Alertas de Stock Mínimo (CU07) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">
              Alertas de Stock Mínimo (CU07)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('kardex')}
            className="text-xs font-bold text-[#997A15] hover:text-[#D4AF37] flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            Gestionar Insumos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {cargando ? (
          <div className="py-8 flex justify-center">
            <GoldSpinner size="md" texto="Cargando alertas de inventario..." />
          </div>
        ) : alertas.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Todos los insumos cuentan con saldo superior al stock mínimo de seguridad.
          </p>
        ) : (
          <div className="space-y-3">
            {alertas.map(a => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-[#D4AF37]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="p-2.5 rounded-lg bg-black text-[#D4AF37] border border-[#D4AF37]/40 shrink-0 mt-0.5 shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{a.nombre}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-bold">
                        {a.codigo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{a.mensaje}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200">
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] text-slate-500 font-medium">Saldo / Mínimo</p>
                    <p className="font-bold text-sm text-[#997A15]">
                      {a.stock_actual} / {a.stock_minimo} {a.unidad_medida}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('kardex')}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-md shadow-[#D4AF37]/15 transition-all cursor-pointer active:scale-95"
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
