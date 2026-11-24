import React, { useState, useRef, useEffect } from 'react';
import { Usuario, AlertaStock } from '../types';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Menu,
  Shield,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  usuario: Usuario;
  vistaActual: string;
  alertas: AlertaStock[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onToggleSidebarMobile?: () => void;
}

export const Navbar: React.FC<Props> = ({
  usuario,
  vistaActual,
  alertas,
  onNavigate,
  onLogout,
  onToggleSidebarMobile,
}) => {
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const [menuAlertasAbierto, setMenuAlertasAbierto] = useState(false);

  const perfilRef = useRef<HTMLDivElement>(null);
  const alertasRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickAfuera = (event: MouseEvent) => {
      if (perfilRef.current && !perfilRef.current.contains(event.target as Node)) {
        setMenuPerfilAbierto(false);
      }
      if (alertasRef.current && !alertasRef.current.contains(event.target as Node)) {
        setMenuAlertasAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  const getTituloVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return 'Panel de Control Operativo';
      case 'kardex':
        return 'Kardex de Inventario (CU06 / CU07)';
      case 'consultas':
        return 'Bandeja de Consultas Multicanal (CU01)';
      case 'pedidos':
        return 'Registro y Gestión de Pedidos (CU02)';
      case 'produccion':
        return 'Módulo de Producción y Control (CU05)';
      case 'comprobantes':
        return 'Facturación y Boletas SUNAT (CU08)';
      default:
        return 'Sistema de Gestión';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Sección Izquierda: Menú Móvil + Breadcrumb / Título */}
      <div className="flex items-center gap-3">
        {onToggleSidebarMobile && (
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              R&M Personaliza
            </span>
            <span className="hidden sm:inline-block text-slate-300">/</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[10px] font-bold text-[#997A15]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
              En Línea • Supabase DB
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
            {getTituloVista()}
          </h2>
        </div>
      </div>

      {/* Sección Derecha: Notificaciones de Alertas + Perfil de Usuario */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dropdown de Alertas de Stock Mínimo */}
        <div className="relative" ref={alertasRef}>
          <button
            onClick={() => {
              setMenuAlertasAbierto(!menuAlertasAbierto);
              setMenuPerfilAbierto(false);
            }}
            title="Alertas de Stock de Insumos"
            className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
              menuAlertasAbierto
                ? 'bg-black text-[#D4AF37] border-black shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-[#D4AF37] hover:text-black hover:bg-slate-50'
            }`}
          >
            <Bell className="w-5 h-5" />
            {alertas.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black font-black text-[10px] px-1.5 py-0.2 rounded-full ring-2 ring-white shadow-sm animate-bounce">
                {alertas.length}
              </span>
            )}
          </button>

          {/* Menú Flotante de Alertas */}
          {menuAlertasAbierto && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-black text-[#D4AF37] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Alertas de Stock (CU07)</h3>
                    <p className="text-[10px] text-slate-500">
                      {alertas.length} insumo(s) en límite de reposición
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#997A15] border border-[#D4AF37]/30">
                  {alertas.length} críticas
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {alertas.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No hay alertas de stock en este momento. Todos los insumos tienen saldo óptimo.
                  </div>
                ) : (
                  alertas.map(a => (
                    <div
                      key={a.id}
                      className="p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{a.nombre}</span>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                            {a.codigo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{a.mensaje}</p>
                        <div className="text-[10px] text-[#997A15] font-bold">
                          Saldo: {a.stock_actual} / Mínimo: {a.stock_minimo} {a.unidad_medida}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setMenuAlertasAbierto(false);
                          onNavigate('kardex');
                        }}
                        className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black text-[11px] rounded-lg shrink-0 shadow-sm transition-all"
                      >
                        Reponer
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl">
                <button
                  onClick={() => {
                    setMenuAlertasAbierto(false);
                    onNavigate('kardex');
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-black hover:text-[#997A15] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Ver Kardex Completo de Insumos
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Separador vertical sutil */}
        <div className="h-7 w-[1px] bg-slate-200"></div>

        {/* Dropdown de Perfil de Usuario */}
        <div className="relative" ref={perfilRef}>
          <button
            onClick={() => {
              setMenuPerfilAbierto(!menuPerfilAbierto);
              setMenuAlertasAbierto(false);
            }}
            className={`flex items-center gap-2.5 p-1.5 pr-2.5 sm:pr-3 rounded-2xl border transition-all cursor-pointer ${
              menuPerfilAbierto
                ? 'bg-black text-white border-black shadow-md'
                : 'bg-white text-slate-800 border-slate-200 hover:border-[#D4AF37] hover:bg-slate-50'
            }`}
          >
            {/* Avatar en Negro y Dorado */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black border border-[#D4AF37] text-[#D4AF37] font-black flex items-center justify-center text-xs shadow-sm">
              <User className="w-4 h-4 text-[#D4AF37]" />
            </div>

            {/* Datos del Usuario */}
            <div className="text-left hidden md:block">
              <p className={`text-xs font-bold leading-tight ${menuPerfilAbierto ? 'text-white' : 'text-slate-900'}`}>
                {usuario.nombre}
              </p>
              <span className="text-[10px] font-mono font-black text-[#D4AF37] uppercase">
                {usuario.rol}
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                menuPerfilAbierto ? 'rotate-180 text-[#D4AF37]' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Menú Flotante de Perfil */}
          {menuPerfilAbierto && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-scale-in">
              {/* Tarjeta de Resumen del Usuario */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-black border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center text-sm font-black shadow-md">
                  <User className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-sm text-slate-900 truncate">{usuario.nombre}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{usuario.correo}</p>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[10px] font-mono font-black text-[#997A15]">
                    <Shield className="w-3 h-3 text-[#D4AF37]" />
                    {usuario.rol}
                  </div>
                </div>
              </div>

              {/* Información de la Empresa */}
              <div className="px-4 py-2.5 text-[11px] text-slate-500 border-b border-slate-100">
                <p className="font-semibold text-slate-700">R&M Personaliza</p>
                <p>San Martín de Porres — Lima, Perú</p>
                <p className="text-[10px] text-[#997A15] font-mono mt-0.5">Sección 17857 • Titulación</p>
              </div>

              {/* Opciones del Menú */}
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setMenuPerfilAbierto(false);
                    onNavigate('dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-black transition-colors"
                >
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <span>Ir al Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setMenuPerfilAbierto(false);
                    onNavigate('kardex');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-black transition-colors"
                >
                  <Package className="w-4 h-4 text-[#D4AF37]" />
                  <span>Gestión de Kardex</span>
                </button>
              </div>

              {/* Botón Cerrar Sesión */}
              <div className="pt-2 px-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMenuPerfilAbierto(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black hover:bg-slate-900 text-[#D4AF37] font-black text-xs transition-all shadow-md active:scale-95"
                >
                  <LogOut className="w-4 h-4 text-[#D4AF37]" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
