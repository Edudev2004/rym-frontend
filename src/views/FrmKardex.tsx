import { useState, useEffect } from 'react';
import { Insumo } from '../types';
import { apiService } from '../services/api';
import { Package, AlertTriangle, PlusCircle, Search, CheckCircle } from 'lucide-react';

export const FrmKardex: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [filtro, setFiltro] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<Insumo | null>(null);
  const [cantidadEntrada, setCantidadEntrada] = useState<number>(10);
  const [observacion, setObservacion] = useState('');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    const data = await apiService.getInsumos();
    setInsumos(data);
  };

  const insumosFiltrados = insumos.filter(i =>
    i.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    i.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoSeleccionado) return;
    setCargando(true);
    try {
      await apiService.registrarMovimiento({
        insumo_id: insumoSeleccionado.id,
        tipo_movimiento: 'ENTRADA',
        motivo: 'COMPRA',
        cantidad: Number(cantidadEntrada),
        observaciones: observacion || 'Compra registrada desde FrmKardex'
      });
      setMensajeExito(`Se agregaron ${cantidadEntrada} ${insumoSeleccionado.unidad_medida} a '${insumoSeleccionado.nombre}' exitosamente.`);
      setModalAbierto(false);
      setObservacion('');
      await cargarInsumos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al registrar entrada en kardex');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-white">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A0A0C] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/50 shadow-md">
              <Package className="w-5 h-5 text-[#D4AF37]" />
            </div>
            Kardex de Inventario (CU06 / CU07)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Control de insumos base, recetas y alertas de stock mínimo para R&M Personaliza.
          </p>
        </div>
      </div>

      {/* Alerta de éxito */}
      {mensajeExito && (
        <div className="bg-[#12151E] border border-[#D4AF37] text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
          <CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-sm font-semibold">{mensajeExito}</span>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
        <input
          type="text"
          placeholder="Buscar insumo por nombre o código..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#12151E] border border-[#242938] rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] shadow-sm transition-all"
        />
      </div>

      {/* Lista Mobile (Tarjetas) */}
      <div className="grid grid-cols-1 md:hidden gap-3">
        {insumosFiltrados.map(i => {
          return (
            <div
              key={i.id}
              className={`p-4 rounded-2xl border transition-all ${
                i.esta_en_alerta
                  ? 'border-[#D4AF37]/60 bg-[#12151E] shadow-lg shadow-black'
                  : 'border-[#242938] bg-[#0A0A0C]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono text-[#D4AF37] bg-black/60 border border-[#D4AF37]/40 px-2 py-0.5 rounded">
                    {i.codigo}
                  </span>
                  <h3 className="font-bold text-white mt-1.5">{i.nombre}</h3>
                  <p className="text-xs text-slate-400">{i.descripcion || 'Sin descripción'}</p>
                </div>
                {i.esta_en_alerta && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Alerta
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#242938] flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Saldo: </span>
                  <span className={`font-black text-sm ${i.esta_en_alerta ? 'text-[#D4AF37]' : 'text-white'}`}>
                    {i.stock_actual} {i.unidad_medida}
                  </span>
                  <span className="text-slate-500 text-xs ml-1">(Mín: {i.stock_minimo})</span>
                </div>
                <button
                  onClick={() => { setInsumoSeleccionado(i); setModalAbierto(true); }}
                  className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Entrada
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-[#12151E] border border-[#242938] rounded-3xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0A0A0C] border-b border-[#242938] text-xs font-black uppercase text-[#D4AF37] tracking-wider">
            <tr>
              <th className="px-5 py-4">Código</th>
              <th className="px-5 py-4">Insumo</th>
              <th className="px-5 py-4 text-center">U.M.</th>
              <th className="px-5 py-4 text-right">Saldo Actual</th>
              <th className="px-5 py-4 text-right">Stock Mínimo</th>
              <th className="px-5 py-4 text-center">Estado Semáforo</th>
              <th className="px-5 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242938]">
            {insumosFiltrados.map(i => {
              return (
                <tr
                  key={i.id}
                  className={`hover:bg-white/[0.04] transition-colors ${
                    i.esta_en_alerta ? 'bg-[#D4AF37]/[0.05]' : ''
                  }`}
                >
                  <td className="px-5 py-4 font-mono text-xs text-[#D4AF37]">{i.codigo}</td>
                  <td className="px-5 py-4 font-bold text-white">{i.nombre}</td>
                  <td className="px-5 py-4 text-center font-mono text-xs text-slate-400">{i.unidad_medida}</td>
                  <td className="px-5 py-4 text-right font-black">
                    <span className={i.esta_en_alerta ? 'text-[#D4AF37] text-base' : 'text-white'}>
                      {i.stock_actual.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-slate-400">{i.stock_minimo.toFixed(2)}</td>
                  <td className="px-5 py-4 text-center">
                    {i.esta_en_alerta ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span> Alerta Reposición
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-white/50"></span> Conforme
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => { setInsumoSeleccionado(i); setModalAbierto(true); }}
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/15 active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Registrar Entrada
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Entrada / Compra (CU06) */}
      {modalAbierto && insumoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12151E] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D4AF37]/50 space-y-5 animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-white">Registrar Entrada de Insumo</h3>
                <p className="text-xs text-[#D4AF37] mt-0.5 font-semibold">{insumoSeleccionado.nombre} ({insumoSeleccionado.codigo})</p>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white text-xl leading-none p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegistrarEntrada} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cantidad a Ingresar ({insumoSeleccionado.unidad_medida})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={cantidadEntrada}
                  onChange={e => setCantidadEntrada(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-[#242938] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Motivo / Observación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Compra factura 001-4521"
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0C] border border-[#242938] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-black rounded-xl text-xs shadow-lg shadow-[#D4AF37]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {cargando ? 'Guardando...' : 'Confirmar Ingreso al Kardex'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
