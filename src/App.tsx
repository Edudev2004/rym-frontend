import { useState } from 'react';
import { FrmDashboard } from './views/FrmDashboard';
import { FrmKardex } from './views/FrmKardex';
import { FrmLogin } from './views/FrmLogin';
import { Usuario } from './types';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  ShoppingCart,
  Hammer,
  Receipt,
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('rym_usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'kardex' | 'consultas' | 'pedidos' | 'produccion' | 'comprobantes'>('dashboard');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const handleLogin = (user: Usuario, token: string) => {
    setUsuario(user);
    localStorage.setItem('rym_usuario', JSON.stringify(user));
    localStorage.setItem('rym_token', token);
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('rym_usuario');
    localStorage.removeItem('rym_token');
  };

  if (!usuario) {
    return <FrmLogin onLogin={handleLogin} />;
  }

  const navegacion = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kardex', label: 'Kardex / Insumos', icon: Package },
    { id: 'consultas', label: 'Consultas (CU01)', icon: MessageSquare, badge: 'Fase 2' },
    { id: 'pedidos', label: 'Pedidos (CU02)', icon: ShoppingCart, badge: 'Fase 3' },
    { id: 'produccion', label: 'Producción (CU05)', icon: Hammer, badge: 'Fase 3' },
    { id: 'comprobantes', label: 'Facturación (CU08)', icon: Receipt, badge: 'Fase 4' },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col md:flex-row">
      {/* Header Mobile */}
      <header className="md:hidden bg-[#0A0A0C] border-b border-[#222634] px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="R&M Personaliza" className="w-9 h-9 object-contain drop-shadow" />
          <div>
            <h1 className="font-bold text-white text-sm leading-none">R&M Personaliza</h1>
            <p className="text-[10px] text-brand-500 font-mono mt-0.5">{usuario.rol}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-black/60 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-black/60"
            aria-label="Abrir menú"
          >
            {sidebarAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Desktop y Drawer Móvil */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0A0A0C] text-slate-300 z-40 flex flex-col justify-between border-r border-[#222634] transition-transform duration-300 ease-in-out ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Oficial */}
          <div className="p-5 border-b border-[#222634] flex items-center gap-3">
            <img
              src="/logo.png"
              alt="R&M Personaliza"
              className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.35)] shrink-0"
            />
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-white text-base leading-tight tracking-tight">R&M Personaliza</h2>
              <p className="text-[11px] text-brand-500 font-medium">SMP — Lima, Perú</p>
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
                      ? 'bg-brand-500 text-black font-black shadow-lg shadow-brand-500/20'
                      : 'hover:bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      activo
                        ? 'bg-black/30 text-black border-black/40 font-bold'
                        : 'bg-black/60 text-slate-400 border-slate-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer del usuario autenticado */}
        <div className="p-4 border-t border-[#222634] bg-black/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-brand-500/15 border border-brand-500/40 text-brand-500 font-bold flex items-center justify-center text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{usuario.nombre}</p>
              <p className="text-[10px] text-brand-500 font-mono font-bold">{usuario.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {vistaActual === 'dashboard' && <FrmDashboard onNavigate={(v) => setVistaActual(v as any)} />}
        {vistaActual === 'kardex' && <FrmKardex />}
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0C] border-t border-[#222634] px-3 py-2 z-30 flex justify-around shadow-2xl">
        <button
          onClick={() => setVistaActual('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors ${
            vistaActual === 'dashboard' ? 'text-brand-500 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Inicio</span>
        </button>
        <button
          onClick={() => setVistaActual('kardex')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors ${
            vistaActual === 'kardex' ? 'text-brand-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Kardex</span>
        </button>
      </nav>
    </div>
  );
}
