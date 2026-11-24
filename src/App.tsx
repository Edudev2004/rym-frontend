import { useState } from 'react';
import { FrmDashboard } from './views/FrmDashboard';
import { FrmKardex } from './views/FrmKardex';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  ShoppingCart,
  Hammer,
  Receipt,
  User,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'kardex' | 'consultas' | 'pedidos' | 'produccion' | 'comprobantes'>('dashboard');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const navegacion = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kardex', label: 'Kardex / Insumos', icon: Package },
    { id: 'consultas', label: 'Consultas (CU01)', icon: MessageSquare, badge: 'Fase 2' },
    { id: 'pedidos', label: 'Pedidos (CU02)', icon: ShoppingCart, badge: 'Fase 3' },
    { id: 'produccion', label: 'Producción (CU05)', icon: Hammer, badge: 'Fase 3' },
    { id: 'comprobantes', label: 'Facturación (CU08)', icon: Receipt, badge: 'Fase 4' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Header Mobile */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-black text-sm flex items-center justify-center">
            R&M
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">R&M Personaliza</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Gestión & Kardex PWA</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarAbierto(!sidebarAbierto)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menú"
        >
          {sidebarAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Desktop y Drawer Móvil */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              R&M
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">R&M Personaliza</h2>
              <p className="text-xs text-slate-400">SMP — Lima, Perú</p>
            </div>
          </div>

          {/* Menú de Enlaces */}
          <nav className="p-4 space-y-1.5">
            {navegacion.map(item => {
              const Icon = item.icon;
              const activo = vistaActual === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'dashboard' || item.id === 'kardex') {
                      setVistaActual(item.id as any);
                    } else {
                      alert(`El módulo '${item.label}' corresponde a la ${item.badge} del roadmap.`);
                    }
                    setSidebarAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activo
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer del usuario autenticado */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Rommel Navarro</p>
            <p className="text-[10px] text-brand-400 font-mono">ADMINISTRADOR</p>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {vistaActual === 'dashboard' && <FrmDashboard onNavigate={(v) => setVistaActual(v as any)} />}
        {vistaActual === 'kardex' && <FrmKardex />}
      </main>

      {/* Bottom Navigation Mobile (RNF01: Control con un solo dedo desde celular) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2 z-30 flex justify-around shadow-lg">
        <button
          onClick={() => setVistaActual('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors ${
            vistaActual === 'dashboard' ? 'text-brand-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Inicio</span>
        </button>
        <button
          onClick={() => setVistaActual('kardex')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors ${
            vistaActual === 'kardex' ? 'text-brand-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Kardex</span>
        </button>
      </nav>
    </div>
  );
}
