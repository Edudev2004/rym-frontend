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
    <div className="min-h-screen bg-[#07090E] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Resplandor dorado de fondo */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#10141D] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Cabecera / Logotipo Oficial de la Marca */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="R&M Personaliza"
              className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.45)]"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              R&M Personaliza
            </h1>
            <p className="text-xs text-[#D4AF37] font-semibold mt-0.5 tracking-wide">
              Sistema Integral de Gestión, Kardex y Producción
            </p>
          </div>
        </div>

        {/* Mensaje de Error si aplica */}
        {error && (
          <div className="bg-[#1C1618] border border-[#D4AF37]/50 text-white text-xs p-3.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0"></span>
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
              <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="ejemplo@rympersonaliza.pe"
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0C] border border-[#242938] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0C] border border-[#242938] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all"
              />
            </div>
          </div>

          {/* Botón 100% Dorado con Texto Negro Puro */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-sm transition-all shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {cargando ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* Selector Rápido por Rol para Sustentación / Demo */}
        <div className="pt-2 border-t border-[#242938] space-y-3">
          <p className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            Acceso Rápido por Rol (Demostración)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => seleccionarRolRapido('admin@rympersonaliza.pe', 'ADMINISTRADOR')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                correo === 'admin@rympersonaliza.pe'
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white font-semibold'
                  : 'bg-black/50 border-[#242938] text-slate-300 hover:text-white hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="font-black text-[11px] text-[#D4AF37]">ADMINISTRADOR</div>
              <div className="truncate text-[10px] text-slate-300">Rommel Navarro</div>
            </button>

            <button
              type="button"
              onClick={() => seleccionarRolRapido('marketing@rympersonaliza.pe', 'MARKETING')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                correo === 'marketing@rympersonaliza.pe'
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white font-semibold'
                  : 'bg-black/50 border-[#242938] text-slate-300 hover:text-white hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="font-black text-[11px] text-[#D4AF37]">MARKETING</div>
              <div className="truncate text-[10px] text-slate-300">Valeria Rios</div>
            </button>

            <button
              type="button"
              onClick={() => seleccionarRolRapido('diseno@rympersonaliza.pe', 'DISENADOR')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                correo === 'diseno@rympersonaliza.pe'
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white font-semibold'
                  : 'bg-black/50 border-[#242938] text-slate-300 hover:text-white hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="font-black text-[11px] text-[#D4AF37]">DISEÑADOR</div>
              <div className="truncate text-[10px] text-slate-300">Carlos Mendez</div>
            </button>

            <button
              type="button"
              onClick={() => seleccionarRolRapido('produccion@rympersonaliza.pe', 'OPERADOR')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                correo === 'produccion@rympersonaliza.pe'
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white font-semibold'
                  : 'bg-black/50 border-[#242938] text-slate-300 hover:text-white hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="font-black text-[11px] text-[#D4AF37]">OPERADOR</div>
              <div className="truncate text-[10px] text-slate-300">Jorge Lopez</div>
            </button>
          </div>
        </div>

        {/* Footer de Seguridad */}
        <div className="text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            Autenticación JWT con Control de Acceso por Roles (ModSeguridad)
          </p>
        </div>
      </div>
    </div>
  );
};
