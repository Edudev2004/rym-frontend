import { useState, useEffect } from 'react';
import { FrmDashboard } from './views/FrmDashboard';
import { FrmKardex } from './views/FrmKardex';
import { FrmConsultas } from './views/FrmConsultas';
import { FrmProductos } from './views/FrmProductos';
import { FrmClientes } from './views/FrmClientes';
import { FrmLogin } from './views/FrmLogin';
import { Navbar } from './components/Navbar';
import { Usuario, AlertaStock } from './types';
import { apiService } from './services/api';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Sparkles,
  Users,
  ShoppingCart,
  Hammer,
  Receipt,
  User,
  X,
  LogOut
} from 'lucide-react';

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('rym_usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'kardex' | 'consultas' | 'productos' | 'clientes' | 'pedidos' | 'produccion' | 'comprobantes'>('dashboard');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);

  useEffect(() => {
    if (usuario) {
      cargarAlertas();
    }
  }, [usuario, vistaActual]);

  const cargarAlertas = async () => {
    try {
      const data = await apiService.getAlertas();
      setAlertas(data);
    } catch {
      // Manejado en fallback
    }
  };

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
    { id: 'consultas', label: 'Consultas (CU01)', icon: MessageSquare },
    { id: 'clientes', label: 'Clientes (Directorio)', icon: Users },
    { id: 'kardex', label: 'Kardex / Insumos', icon: Package },
    { id: 'productos', label: 'Catálogo & Recetas', icon: Sparkles },
    { id: 'pedidos', label: 'Pedidos (CU02)', icon: ShoppingCart, badge: 'Fase 3' },
    { id: 'produccion', label: 'Producción (CU05)', icon: Hammer, badge: 'Fase 3' },
    { id: 'comprobantes', label: 'Facturación (CU08)', icon: Receipt, badge: 'Fase 4' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col md:flex-row">
      {/* Overlay para móvil cuando el sidebar está abierto */}
      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Desktop y Drawer Móvil — Estricto Negro (#0A0A0C) y Dorado (#D4AF37) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0A0A0C] text-slate-300 z-50 flex flex-col justify-between border-r border-[#1E2028] transition-transform duration-300 ease-in-out shrink-0 ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Oficial */}
          <div className="p-5 border-b border-[#1E2028] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="R&M Personaliza"
                className="w-11 h-11 object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] shrink-0"
              />
              <div className="overflow-hidden">
                <h2 className="font-extrabold text-white text-base leading-tight tracking-tight">R&M Personaliza</h2>
                <p className="text-[11px] text-[#D4AF37] font-semibold">SMP — Lima, Perú</p>
              </div>
            </div>

            {/* Botón cerrar en móvil */}
            <button
              onClick={() => setSidebarAbierto(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
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
                    if (item.id === 'dashboard' || item.id === 'kardex' || item.id === 'consultas' || item.id === 'productos' || item.id === 'clientes') {
                      setVistaActual(item.id as any);
                    } else {
                      alert(`El módulo '${item.label}' corresponde a la ${item.badge} del roadmap.`);
                    }
                    setSidebarAbierto(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activo
                      ? 'bg-[#D4AF37] text-black font-black shadow-lg shadow-[#D4AF37]/25'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      activo
                        ? 'bg-black/30 text-black border-black/30 font-bold'
                        : 'bg-black/60 text-[#D4AF37] border-[#D4AF37]/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer del usuario autenticado en Sidebar */}
        <div className="p-4 border-t border-[#1E2028] bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-black border border-[#D4AF37] text-[#D4AF37] font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
              <User className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{usuario.nombre}</p>
              <p className="text-[10px] text-[#D4AF37] font-mono font-black">{usuario.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 rounded-lg text-slate-400 hover:text-[#D4AF37] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Área Principal: Fondo Blanco / Slate-50 con Navbar Superior */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
        {/* Navbar con Alertas y Perfil */}
        <Navbar
          usuario={usuario}
          vistaActual={vistaActual}
          alertas={alertas}
          onNavigate={(v) => setVistaActual(v as any)}
          onLogout={handleLogout}
          onToggleSidebarMobile={() => setSidebarAbierto(!sidebarAbierto)}
        />

        {/* Contenedor de Vistas con Fondo Blanco */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {vistaActual === 'dashboard' && (
            <FrmDashboard onNavigate={(v) => setVistaActual(v as any)} />
          )}
          {vistaActual === 'consultas' && (
            <FrmConsultas onNavigate={(v) => setVistaActual(v as any)} />
          )}
          {vistaActual === 'kardex' && (
            <FrmKardex onInsumoActualizado={cargarAlertas} />
          )}
          {vistaActual === 'productos' && (
            <FrmProductos onNavigate={(v) => setVistaActual(v as any)} />
          )}
          {vistaActual === 'clientes' && (
            <FrmClientes onNavigate={(v) => setVistaActual(v as any)} />
          )}
        </main>
      </div>

      {/* Bottom Navigation Mobile — Negro y Dorado */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0C] border-t border-[#1E2028] px-2 py-2 z-30 flex justify-around shadow-2xl">
        <button
          onClick={() => setVistaActual('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            vistaActual === 'dashboard' ? 'text-[#D4AF37] font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Inicio</span>
        </button>
        <button
          onClick={() => setVistaActual('consultas')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            vistaActual === 'consultas' ? 'text-[#D4AF37] font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Consultas</span>
        </button>
        <button
          onClick={() => setVistaActual('kardex')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            vistaActual === 'kardex' ? 'text-[#D4AF37] font-bold' : 'text-slate-400'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Kardex</span>
        </button>
        <button
          onClick={() => setVistaActual('productos')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            vistaActual === 'productos' ? 'text-[#D4AF37] font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Catálogo</span>
        </button>
      </nav>
    </div>
  );
}
