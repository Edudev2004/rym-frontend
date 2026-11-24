import { useState } from 'react';
import { apiService } from '../services/api';
import { Usuario } from '../types';
import { Lock, Mail, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface Props {
  onLogin: (user: Usuario, token: string) => void;
}

export const FrmLogin: React.FC<Props> = ({ onLogin }) => {
  const [correo, setCorreo] = useState('admin@rympersonaliza.pe');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const data = await apiService.login(correo, password);
      onLogin(data.usuario, data.access_token);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarRolRapido = (emailRol: string, _rolNombre?: string) => {
    setCorreo(emailRol);
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Cabecera / Identidad de la Marca */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 text-white font-black text-2xl items-center justify-center shadow-lg shadow-brand-500/30">
            R&M
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            R&M Personaliza
          </h1>
          <p className="text-xs text-slate-400">
            Sistema Integral de Gestión, Kardex y Producción
          </p>
        </div>

        {/* Mensaje de Error si aplica */}
        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="ejemplo@rympersonaliza.pe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
          >
            {cargando ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Selector Rápido por Rol para Sustentación / Demo */}
        <div className="pt-2 border-t border-slate-700/60 space-y-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-brand-400" />
            Acceso Rápido por Rol (Demostración)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => seleccionarRolRapido('admin@rympersonaliza.pe', 'ADMINISTRADOR')}
              className={`p-2 rounded-xl border text-left transition-all ${
                correo === 'admin@rympersonaliza.pe'
                  ? 'bg-brand-600/20 border-brand-500 text-white font-semibold'
                  : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-[11px] text-brand-400">ADMINISTRADOR</div>
              <div className="truncate text-[10px]">Rommel Navarro</div>
            </button>

            <button
              type="button"
              onClick={() => seleccionarRolRapido('marketing@rympersonaliza.pe', 'MARKETING')}
              className={`p-2 rounded-xl border text-left transition-all ${
                correo === 'marketing@rympersonaliza.pe'
                  ? 'bg-brand-600/20 border-brand-500 text-white font-semibold'
                  : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-[11px] text-amber-400">MARKETING</div>
              <div className="truncate text-[10px]">Valeria Rios</div>
            </button>

            <button
              type="button"
              onClick={() => seleccionarRolRapido('diseno@rympersonaliza.pe', 'DISENADOR')}
              className={`p-2 rounded-xl border text-left transition-all ${
                correo === 'diseno@rympersonaliza.pe'
                  ? 'bg-brand-600/20 border-brand-500 text-white font-semibold'
                  : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-[11px] text-blue-400">DISEÑADOR</div>
              <div className="truncate text-[10px]">Carlos Mendez</div>
            </button>

            <button
              type="button"
              onClick={() => seleccionarRolRapido('produccion@rympersonaliza.pe', 'OPERADOR')}
              className={`p-2 rounded-xl border text-left transition-all ${
                correo === 'produccion@rympersonaliza.pe'
                  ? 'bg-brand-600/20 border-brand-500 text-white font-semibold'
                  : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-[11px] text-emerald-400">OPERADOR</div>
              <div className="truncate text-[10px]">Jorge Lopez</div>
            </button>
          </div>
        </div>

        {/* Footer de Seguridad */}
        <div className="text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Autenticación JWT con Control de Acceso por Roles (ModSeguridad)
          </p>
        </div>
      </div>
    </div>
  );
};
